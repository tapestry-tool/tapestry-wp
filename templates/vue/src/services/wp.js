export const data = {
  ...wpData,
  apiUrl,
  postId: wpPostId,
}

export const getCurrentUser = () => ({
  id: wpData.currentUser.data.ID,
  name: wpData.currentUser.data.user_nicename,
  email: wpData.currentUser.data.user_email,
})
