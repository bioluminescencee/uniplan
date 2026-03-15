import { supabase } from './supabase'

export async function createGroup(name, user_id) {
    const { data, error } = await supabase
        .from('groups')
        .insert({ name, created_by: user_id })
        .select()
        .single()
    if (error) throw error

    await supabase.from('group_members').insert({
        group_id: data.id, user_id: user_id
    })
    return data
}

export async function joinByCode(inviteCode, user_id) {
    const { data: group, error } = await supabase
        .from('groups')
        .select('id')
        .eq('invite_code', inviteCode)
        .single()
    if (error) throw new Error('Invalid invite code')

    await supabase.from('group_members').insert({
        group_id: group.id, user_id: user_id
    })
    return group
}