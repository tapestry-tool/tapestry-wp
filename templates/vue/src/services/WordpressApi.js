import axios from "axios"

const API_URL = `${wpData.rest_url}/wp/v2`

async function getPosts() {
  return axios.get(`${API_URL}/posts`).then(res => {
    const { data } = res
    return data.map(post => ({
      ...post,
      content: post.content.rendered,
      title: post.title.rendered,
    }))
  })
}

export default { getPosts }
