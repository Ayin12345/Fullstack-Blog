const maxBy = require('lodash/maxBy')
const sumBy = require('lodash/sumBy')
const groupBy = require('lodash/groupBy')
const orderBy = require('lodash/orderBy')

const dummy = (blogs) => {
    return 1
  }

totalLikes = (blogs) => {
  const totalLikes = (sum, blog) => sum + blog.likes
  return blogs.reduce(totalLikes, 0)
}

favoriteBlog = (blogs) => {
  if (blogs.length === 0) {return 0}
  
  return maxBy(blogs, 'likes')
}

mostBlogs = (blogs) => {
  if (blogs.length === 0) return {}

  const { author } = maxBy(blogs, (blog) => blog.author)
  const reducer = (sum, element) => element.author === author ? sum + 1 : sum
  const blogsByAuthor = blogs.reduce(reducer, 0)
  return { author: author, blogs: blogsByAuthor }
}

mostLikes = (blogs) => {

  function removeDuplicates(arr) {
    return arr.filter((item,
        index) => arr.indexOf(item) === index);
  }
  
  if (blogs.length === 0) {return 0}

  let likeList = []
  const names = blogs.map(blog => blog.author)
  let newNames = removeDuplicates(names)
  for (let i = 0; i < newNames.length; i++) {
    let authorLikes = sumBy(blogs.filter(blog => blog.author === newNames[i]), 'likes')
    likeList.push({author: `${newNames[i]}`, likes: authorLikes})
  }
  let finalList = orderBy(likeList, ['likes'], ['desc'])
  return(finalList[0])
}

module.exports = {dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes}