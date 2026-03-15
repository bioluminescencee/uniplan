import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useGroupSelection(user_id) {
    const [groups, setGroups] = useState([])
    const [currentGroupId, setCurrentGroupId] = useState(null)
    const [loading, setLoading] = useState(true)

    async function loadGroups() {
        const { data } = await supabase
            .from('group_members')
            .select('groups(*)')
            .eq('user_id', user_id)
        const fetched = data?.map(r => r.groups) ?? []
        setGroups(fetched)
        // Auto-select the first group, or restore from localStorage
        const saved = localStorage.getItem('currentGroupId')
        const valid = fetched.find(g => g.id === saved)
        setCurrentGroupId(valid ? saved : fetched[0]?.id ?? null)
        setLoading(false)
    }

    function selectGroup(id) {
        setCurrentGroupId(id)
        localStorage.setItem('currentGroupId', id)
    }

    // async function createGroup(name) {
    //     const { data: { user }, error: userError } = await supabase.auth.getUser()

    //     if (userError || !user) throw new Error('Could not get authenticated user')
    //     console.log('uid:', user.id)
    //     const { data, error } = await supabase
    //         .from('groups')
    //         .insert({ name, created_by: user.id })
    //         .select()
    //         .single()

    //     console.log('created group:', data);
    //     if (error) throw error
        

    //     await supabase
    //         .from('group_members')
    //         .insert([{ group_id: data.id, user_id: user.id }])

    //     setGroups(prev => [...prev, data])
    //     selectGroup(data.id)
    //     return data
    // }

    async function createGroup(name) {
        const { data, error } = await supabase
            .rpc('create_group', { group_name: name })

        if (error) throw error

        setGroups(prev => [...prev, data])
        selectGroup(data.id)
        return data
    }

    async function joinGroup(inviteCode) {
        const { data: group, error } = await supabase
            .from('groups')
            .select('*')
            .eq('invite_code', inviteCode.trim().toLowerCase())
            .single()
        if (error) throw new Error('Invalid invite code')
        await supabase.from('group_members').insert({
            group_id: group.id, user_id: user_id
        })
        setGroups(prev => [...prev, group])
        selectGroup(group.id)
        return group
    }

    useEffect(() => {
        if (!user_id) return
        loadGroups()
    }, [user_id])



    return { groups, currentGroupId, loading, selectGroup, createGroup, joinGroup }
}