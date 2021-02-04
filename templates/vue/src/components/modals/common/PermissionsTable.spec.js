import { render } from "@/utils/test"
import PermissionsTable from "./PermissionsTable.vue"

describe("Permissions Table", () => {
  it("should render public, authenticated, and user permissions", async () => {
    const permissions = {
      public: ["read"],
      authenticated: ["read"],
      "user-1": ["read", "add"],
    }
    const screen = render(PermissionsTable, {
      props: { value: permissions },
    })
    for (const role of Object.keys(permissions)) {
      await screen.findByText(new RegExp(role), "i")
      for (const permission of permissions[role]) {
        expect(
          screen.getByTestId(`node-permissions-${role}-${permission}`)
        ).toBeChecked()
      }
    }
  })
})
