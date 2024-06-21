const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')


test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {

  test('returns 0 when list is empty', () => {
    const blogs = []

    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const blogs = [{name: 'testSingular', author: 'Aleksei Yin', likes: 5}]

    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 5)
  })

  test('larger list should return sum of likes in the list', () => {
    const blogs = [{ title: 'test 1', author: 'Aleksei Yin', likes: 10 }, { title: 'test 1', author: 'Aleksei Yin', likes: 7 }, { title: 'test 1', author: 'Aleksei Yin', likes: 2 }]

    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 19)
  })
})

describe('favorite blog', () => {
  test('no favorite blog if list is empty', () => {
    const blogs = []

    const result = listHelper.favoriteBlog(blogs)
    assert.deepStrictEqual(result, 0)
  })

  test('The only blog in the list is the favorite as well', () => {
    const blogs = [{title: "Canonical string reduction", author: "Edsger W. Dijkstra", likes: 12}]

    const result = listHelper.favoriteBlog(blogs)
    assert.deepStrictEqual(result, blogs[0])
  })

  test('Out of numerous blogs, the blog with the most likes is the favorite', () => {
    const blogs = [{title: 'not favorite blog', author: "Aleksei Yin", likes: 2}, {title: 'not favorite blog', author: "Aleksei Yin", likes: 5}, {title: 'favorite blog', author: "Aleksei Yin", likes: 10}]

    const result = listHelper.favoriteBlog(blogs)
    assert.deepStrictEqual(result, blogs[2])
  })
})

describe('most blogs', () => {
  test('returns empty object, if array is empty', () => {
    const blogs = []
    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, {})
  })

  test('returns author with most blogs including blog count', () => {
    const blogs = [
      { name: 'Blog title 1', author: 'Most blogs author', likes: 1 },
      { name: 'Blog title 2', author: 'Most blogs author', likes: 2 },
      { name: 'Blog title 3', author: 'Most blogs author', likes: 3 },
      { name: 'Blog title 4', author: 'Middle author', likes: 4 },
      { name: 'Blog title 2', author: 'Most blogs author', likes: 2 },
      { name: 'Blog title 5', author: 'Middle author', likes: 5 },
      { name: 'Blog title 6', author: 'Least blogs author', likes: 100 },
      { name: 'Blog title 2', author: 'Most blogs author', likes: 2 }
    ]
    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, { author: 'Most blogs author', blogs: 5 })
  })

  test('returns author, if only one in list', () => {
    const blogs = [{ name: 'Blog title 1', author: 'Most blogs author', likes: 10000 }]
    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, { author: 'Most blogs author', blogs: 1 })
  })
})


describe('most likes', () => {
  test('no author will be awarded the most likes if there are no blogs', () => {
    const blogs = []

    const result = listHelper.mostLikes(blogs)
    assert.deepStrictEqual(result, 0)
  })

  test('Out of numerous blogs, the author with the most combined likes should be shown', () => {
    const blogs = [
      { name: 'Blog title 1', author: 'Author with most likes', likes: 555 },
      { name: 'Blog title 1', author: 'Author with some likes', likes: 1 },
      { name: 'Blog title 1', author: 'Author with least likes', likes: 1 },
      { name: 'Blog title 1', author: 'Author with most likes', likes: 555 },
      { name: 'Blog title 1', author: 'Author with some likes', likes: 1 },
      { name: 'Blog title 1', author: 'Author with some likes', likes: 9999 },
      { name: 'Blog title 1', author: 'Author with least likes', likes: 1 },
      { name: 'Blog title 1', author: 'Author with most likes', likes: 555 },
      { name: 'Blog title 1', author: 'Author with least likes', likes: 555 },
      { name: 'Blog title 1', author: 'Author with most likes', likes: 9999 }
    ]
    const result = listHelper.mostLikes(blogs)
    assert.deepStrictEqual(result, {author: 'Author with most likes', likes: 11664})
  })

  test('returns author with likes, if only on in array', () => {
    const blogs = [{ name: 'Blog title 1', author: 'Some author', likes: 4 }]
    const result = listHelper.mostLikes(blogs)
    assert.deepStrictEqual(result, { author: 'Some author', likes: 4 })
  })
})