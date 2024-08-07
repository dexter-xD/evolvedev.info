import axios from 'axios';
import { Post } from '~/types';

type HygraphEnv = {
  HYGRAPH_API_URL: string;
  HYGRAPH_API_TOKEN: string;
};

// getHygraphData gets the data from hyfraph endpoint.
// Takes a graphql query of type string as parameter.
// Returns the response object and the hygraph data.
export const getHygraphData = async (query: string, env: HygraphEnv) => {
  const result = await axios.post(
    env.HYGRAPH_API_URL,
    { query },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.HYGRAPH_API_TOKEN}`,
      },
    }
  );

  return { response: result, data: result.data?.data ?? null };
};

export const getPosts = async (env: HygraphEnv) => {
  const query = `
    query Posts {
      forLandingPosts: posts(where: {forLanding: true}) {
        id
        publishDate
        category
        title
        excerpt {
          text
        }
        author
      } 
      isLatestPosts: posts(where: {isLatest: true}, first: 3) {
        id
        publishDate
        category
        title
        excerpt {
          text
        }
        author
      }   
    }
  `;

  const { data } = await getHygraphData(query, env);

  const combinedPosts = [
    ...data.forLandingPosts,
    ...data.isLatestPosts
  ];
  const uniquePosts = Array.from(new Map(combinedPosts.map(post => [post.id, post])).values());

  return uniquePosts as Omit<Post, 'content'>[];
};


