/**
 * This module represents the communication layer between Tapestry and WordPress.
 * All Tapestry components that need information from WordPress should talk to this
 * layer to get that information.
 */

/* eslint-disable no-undef */

/**
 * Object containing all data exported by `wpData`.
 */
export const data = {
  ...wpData,
  apiUrl,
  postId: wpPostId,
}

export const getCurrentUser = () => ({
  id: wpData.currentUser.ID,
  name: wpData.currentUser.data.user_nicename,
  email: wpData.currentUser.data.user_email,
  roles: wpData.currentUser.roles,
})

export const isLoggedIn = () => Boolean(wpData.currentUser.ID)

export const canEditTapestry = () => wpData.wpCanEditTapestry === "1"
