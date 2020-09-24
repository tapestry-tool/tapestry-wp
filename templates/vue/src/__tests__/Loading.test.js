import { render } from "@testing-library/vue"
import Loading from "@/components/Loading.vue"

it("should render given label", () => {
  const label = "Hi!"
  const { getByText } = render(Loading, { props: { label: "Hi!" } })
  getByText(label)
})
