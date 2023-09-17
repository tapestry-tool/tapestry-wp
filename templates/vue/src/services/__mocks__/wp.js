/**
 * List of props in the `wpData` object. These are defined in the
 * `tapestry.php` file in the root directory.
 */
const props = [
  "directoryUrl",
  "vueUrl",
  "restUrl",
  "wpUrl",
  "appPath",
  "postCategories",
  "nonce",
  "wpUserId",
  "adminAjaxUrl",
  "fileUploadNonce",
  "uploadUrl",
  "roles",
  "wpCanEditTapestry",
  "currentUser",
]

export const data = {
  ...Object.fromEntries(props.map(prop => [prop, ""])),
  apiUrl: "testing",
  postId: 0,
  nonce: "my_nonce",
  currentUser: {
    ID: "1",
    roles: ["administrator"],
  },
  roles: [
    {
      administrator: "Administrator",
      author: "Author",
      contributor: "Contributor",
      editor: "Editor",
      subscriber: "Subscriber",
    },
  ],
}

export const getCurrentUser = jest.fn().mockReturnValue({
  id: "1",
  name: "admin",
  email: "foo@bar.com",
  roles: ["administrator"],
})

export const isCurrentUser = jest.fn().mockReturnValue(true)

export const isLoggedIn = jest.fn().mockReturnValue(true)

export const canEditTapestry = jest.fn().mockReturnValue(true)

export const canReview = jest.fn().mockReturnValue(true)

export const getKalturaStatus = jest.fn().mockReturnValue(true)
