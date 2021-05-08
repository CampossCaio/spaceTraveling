import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import Link from 'next/link';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useEffect, useState } from 'react';
import { dateFormatter } from '../utils/dateFormatter';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }:HomeProps) {
  const {next_page , results } = postsPagination;
  
  const [posts, setPosts] = useState<Post[]>(results);
  const [nextPage, setNextPage ] = useState<string | null>(next_page);


  useEffect(() => {

  },[posts]);

  function handleLoadMorePosts() {
    fetch(nextPage)
    .then(respose => respose.json())
    .then(response => {
      const newPosts = response.results.map( (post: Post) => {
        return {
          uid: post.uid,
          first_publication_date: post.first_publication_date,
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          }
        }
      });

      setPosts([...posts, ...newPosts]);
      setNextPage(response.next_page);
    });
  }

  return (
    <main className={styles.container}>
      <img src="/images/Logo.svg" alt="logo"/>
      <div className={styles.postList}>
       {
         posts.map( post => (
          <Link key={post?.uid} href={`/post/${post.uid}`}>
            <a>
              <h1>{post.data?.title}</h1>
              <p>{post.data?.subtitle}</p>
              <div>
                <span>
                  <FiCalendar/>
                  {dateFormatter(post.first_publication_date)}
                </span>
                <span>
                  <FiUser/>
                  {post.data?.author}
                </span>
              </div>
            </a>
          </Link>
        ))
       }
      </div>
      {
        nextPage && (
          <button
            onClick={handleLoadMorePosts}
          >
          Carregar mais posts
          </button>
        )
      }
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type','post'),
  ],{
      pageSize: 5,
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return{
    props: {
      postsPagination,
    }
  }
};
