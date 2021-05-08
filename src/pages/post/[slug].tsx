import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { dateFormatter } from '../../utils/dateFormatter';

interface Post {
  uid:string;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {

  const router = useRouter();

  if(router.isFallback) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <Header />
      <main className={styles.container}>
        <img src={post.data.banner.url} alt="thumbnail"/>
        <div className={styles.content}>
          <h1>{post.data.title}</h1>
          <div className={styles.postInfo}>
            <span>
              <FiCalendar/>
              {dateFormatter(post.first_publication_date)}
            </span>
            <span>
              <FiUser/>
             {post.data.author}
            </span>
            <span>
              <FiClock/>
              4 min
            </span>
          </div>
          
          {
            post.data.content.map(content => (
              <article key={post.uid}>
                <h2>{content.heading}</h2>
                <div dangerouslySetInnerHTML={{__html: String(RichText.asHtml(content.body))}}/>
             </article>
            ))
          }
        </div>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], 
   {
    pageSize: 5
  });

  const paths = posts.results.map( post => {
    return {
      params: {
        slug: post.uid,
      }
    }
  });

  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug  } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle:response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body
        }
      }),
    }
  }

  return {
    props: {
      post,
    }
  }
};
