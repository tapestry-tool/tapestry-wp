import axios from "axios"

const API_URL = `${wpData.rest_url}/wp/v2`

async function getPosts() {
  let totalPages
  let posts = []
  const res = await axios.get(`${API_URL}/posts`)
  console.log(res.headers["x-wp-totalpages"])
  totalPages = res.headers["x-wp-totalpages"]
  console.log("total pages" + totalPages)
  for (let i = 1; i <= totalPages; i++) {
    const res = await axios.get(`${API_URL}/posts?page=${i}`)
    console.log(res.data)
    posts = posts.concat(res.data)
  }
  console.log(posts)
  return posts.map(parsePost)
}

async function getPostById(id) {
  return axios
    .get(`${API_URL}/posts/${id}`)
    .then(res => res.data)
    .then(parsePost)
}

export default { getPosts, getPostById }

const parsePost = post => ({
  ...post,
  content: post.content.rendered,
  title: post.title.rendered,
})
