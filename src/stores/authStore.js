import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const useAuthStore = create()(
    persist(
        set => ({
            isAuthenticated: false,
            user: null,
            token: null,
            login: (user, token) => {
                set({ isAuthenticated: true, user, token })
            },
            logout: () => {
                set({ isAuthenticated: false, user: null, token: null })
            },
        }),
        {
            name: 'auth',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)

export default useAuthStore