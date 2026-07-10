import { CustomerProfileView } from "@/components/customer-profile-view"

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CustomerProfileView customerId={id} />
}
