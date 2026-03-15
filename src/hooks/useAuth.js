import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { COLORS } from '../utils'

export function useAuth() {
    const [session, setSession] = useState(null)
    const [profile, setProfile] = useState(null)
    

    async function fetchProfile(user_id) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user_id)
            .single()
        setProfile(data)
    }

    async function signUp(email, password, name) {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }   // available as raw_user_meta_data in the trigger
            }
        })
        if (error) throw error
        // No manual profiles insert needed — trigger handles it
    }

    async function signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
    }

    async function signOut() {
        await supabase.auth.signOut()
    }
    async function updateProfile(updates) {
        const { data: { user } } = await supabase.auth.getUser()
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
        if (error) throw error
        setProfile(prev => ({ ...prev, ...updates }))
    }


    useEffect(() => {
        // getSession() restores from localStorage synchronously on most platforms
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session ?? null)
            if (session) fetchProfile(session.user.id)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session ?? null)
                if (session) fetchProfile(session.user.id)
                else setProfile(null)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const loading = session === undefined

    return { session, profile, loading, signUp, signIn, signOut, updateProfile }
}