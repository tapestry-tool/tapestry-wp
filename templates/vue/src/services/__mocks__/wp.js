/**
 * List of props in the `wpData` object. These are defined in the
 * `single-tapestry.php` file in the root directory.
 */
const props = [
  "directory_uri",
  "vue_uri",
  "rest_url",
  "wpUrl",
  "app_path",
  "post_categories",
  "gf_rest_url",
  "nonce",
  "gf_nonce",
  "wpUserId",
  "adminAjaxUrl",
  "file_upload_nonce",
  "upload_url",
  "roles",
  "wpCanEditTapestry",
  "currentUser",
]

export const data = {
  ...Object.fromEntries(props.map(prop => [prop, ""])),
  apiUrl: "testing",
  postId: 0,
  roles: ["administrator", "subscriber", "editor"],
}

export const getCurrentUser = jest.fn().mockReturnValue({
  id: "1",
  name: "admin",
  email: "foo@bar.com",
  roles: ["administrator"],
})

export const isLoggedIn = jest.fn().mockReturnValue(true)

export const canEditTapestry = jest.fn().mockReturnValue(true)
