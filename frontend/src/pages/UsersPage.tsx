import { useUsers } from '../features/users/hooks'

export function UsersPage() {
  const { data, isLoading } = useUsers()
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Users</h1>
      <div className="rounded border border-slate-200 bg-white p-4">
        {isLoading
          ? 'Loading...'
          : data?.map((user) => (
              <div key={user.id} className="border-b border-slate-100 py-2 text-sm last:border-b-0">
                {user.name} ({user.role}) - {user.email}
              </div>
            ))}
      </div>
    </section>
  )
}
