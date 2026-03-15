import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useGroup(groupId) {
    const [members, setMembers] = useState([])
    const [events, setEvents] = useState([])
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!groupId) return

        let evChannel, actChannel

        async function init() {
            // Wait for a confirmed session before querying
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            await loadAll()

            // Pass the access token explicitly to the realtime channels
            evChannel = supabase
                .channel(`events:${groupId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'events',
                        filter: `group_id=eq.${groupId}`,
                    },
                    () => loadEvents(session)
                )
                .subscribe()

            actChannel = supabase
                .channel(`activities:${groupId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'activities',
                        filter: `group_id=eq.${groupId}`,
                    },
                    () => loadActivities(session)
                )
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'rsvps',
                    },
                    () => loadActivities(session)
                )
                .subscribe()
        }

        init()

        // Re-run if the session changes mid-life (e.g. token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session && groupId) loadAll()
            }
        )

        return () => {
            if (evChannel) supabase.removeChannel(evChannel)
            if (actChannel) supabase.removeChannel(actChannel)
            subscription.unsubscribe()
        }
    }, [groupId])

    async function loadAll() {
        setLoading(true)
        await Promise.all([loadMembers(), loadEvents(), loadActivities()])
        setLoading(false)
    }

    async function loadMembers() {
        const { data, error } = await supabase
            .from('group_members')
            .select('profiles(*)')
            .eq('group_id', groupId)

        if (error) { console.error('loadMembers:', error); return }
        setMembers(data?.map(r => r.profiles) ?? [])
    }

    async function loadEvents() {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('group_id', groupId)

        if (error) { console.error('loadEvents:', error); return }
        setEvents(data ?? [])
    }

    async function loadActivities() {
        const { data, error } = await supabase
            .from('activities')
            .select('*, rsvps(*)')
            .eq('group_id', groupId)

        if (error) { console.error('loadActivities:', error); return }

        setActivities((data ?? []).map(a => ({
            ...a,
            rsvps: Object.fromEntries(
                a.rsvps.map(r => [r.user_id, r.answer])
            ),
        })))
    }

    async function addEvent(eventData) {
        const { error } = await supabase
            .from('events')
            .insert({ ...eventData, group_id: groupId })

        if (error) throw error
        loadEvents();
    }

    async function addActivity(actData) {
        const { error } = await supabase
            .from('activities')
            .insert({ ...actData, group_id: groupId })

        if (error) throw error
        loadActivities();
    }

    async function upsertRSVP(activityId, user_id, answer) {
        const { error } = await supabase
            .from('rsvps')
            .upsert(
                { activity_id: activityId, user_id: user_id, answer },
                { onConflict: 'activity_id,user_id' }
            )

        if (error) throw error
        loadActivities();
    }

    return {
        members, events, activities, loading,
        addEvent, addActivity, upsertRSVP,
        refresh: loadAll,
    }
}