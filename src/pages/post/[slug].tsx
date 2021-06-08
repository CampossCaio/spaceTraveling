import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { format } from'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { dateFormatter } from '../../utils/dateFormatter';
import { Comments } from '../../components/Comments';
import { useEffect, useState } from 'react';
import { PostNavigation } from '../../components/PostNavigation';

interface Post {
  uid:string;
  first_publication_date: string | null;
  last_publication_date: string | null;
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

interface PostInfo {
  uid: string;
  data: {
    title: string
  };
}

export default function Post({ post }: PostProps) {
  const [nextPost, setNextPost] = useState<PostInfo>();
  const [previousPost, setPreviousPost] = useState<PostInfo>();

  useEffect(() => {
    fetch('https://space-travelingg.cdn.prismic.io/api/v2/documents/search?ref=YKBXnhIAACQAwW0W#format=json')
    .then(response => response.json())
    .then(data => {
      const index = data.results.findIndex(result => result.uid === post?.uid)
      setPreviousPost(data.results[index - 1]);
      setNextPost(data.results[index + 1]);
    });
  },[post]);

  const router = useRouter();

  if(router.isFallback) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.post}>
          <img src={post.data.banner.url} alt="thumbnail"/>
          <div className={styles.content}>
            <h1>{post.data.title}</h1>
            <div className={styles.postInfo}>
              <div>
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
              <span>
                <i>
                  {
                    format(new Date(post.last_publication_date),
                      "'* editado em 'dd MMM yyyy', às 'hh:mm'",
                      {
                        locale: ptBR,
                      }
                    )

                  }
                </i>
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
        </div>
        <PostNavigation  
          previousPost={previousPost}
          nextPost={nextPost}
        />
        <Comments post_uid={post.uid}/>
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

  console.log('response',response);

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
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
