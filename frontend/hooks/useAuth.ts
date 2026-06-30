'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types';

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: profile } = await supabase
          .from('users_profile')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setUser(profile);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.id);

        if (event === 'SIGNED_IN' && session?.user) {
          // ✅ جلب البيانات لما يدخل المستخدم
          const { data: profile } = await supabase
            .from('users_profile')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setUser(profile);
          setLoading(false);
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }

        if (event === 'USER_UPDATED') {
          const { data: profile } = await supabase
            .from('users_profile')
            .select('*')
            .eq('id', session?.user?.id)
            .single();
          setUser(profile);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ✅ حماية الصفحات المحمية (dashboard)
  useEffect(() => {
    if (!loading && !user && pathname.startsWith('/dashboard')) {
      router.push('/login');
    }
  }, [loading, user, pathname, router]);

  const logout = async () => {
    await supabase.auth.signOut();
    // SIGNED_OUT هيتعالج في onAuthStateChange
  };

  return { user, loading, logout };
}
