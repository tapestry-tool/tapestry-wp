export const data = {
  apiUrl: "testing",
  postId: 0,
  nonce: "my_nonce",
  vue_uri: "testing",
}

export const getCurrentUser = jest.fn().mockReturnValue({
  id: "1",
  name: "admin",
  email: "foo@bar.com",
})
