import Link from 'next/link';
import { useEffect } from 'react';

import styles from './styles.module.scss';

interface Post {
  uid: string;
  data: {
    title: string
  };
}

interface PostNavigationProps {
  nextPost: Post | undefined;
  previousPost: Post | undefined;
}

export function PostNavigation({ previousPost, nextPost }: PostNavigationProps) {

  return (
    <div className={styles.container}>
        {
          previousPost ? (
            <Link href={`/post/${previousPost?.uid}`}>
              <a className={styles.previous}>
                <span>{previousPost.data.title}</span>
                <p>Post anterior</p>
              </a>
           </Link>
          ): <div/>
        }
       {
         nextPost ? (
          <Link href={`/post/${nextPost?.uid}`}>
            <a className={styles.next}>
            <span>{nextPost?.data.title}</span>
              <p>Próximo post</p>
            </a>
          </Link>
         ): <div/>
       }
    </div>
  )
}