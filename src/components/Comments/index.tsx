import { useEffect, useRef } from 'react';

interface CommentsProps {
  post_uid: string;
}

export function Comments({ post_uid }:CommentsProps) {

  const divRef = useRef(null);

    useEffect(() => {
     
      let script = document.createElement("script");
      console.log(script);
      script.setAttribute("src", "https://utteranc.es/client.js");
      script.setAttribute("crossorigin","anonymous");
      script.setAttribute("async", "true");
      script.setAttribute("repo", "CampossCaio/spaceTraveling");
      script.setAttribute("issue-term", "pathname");
      script.setAttribute( "theme", "github-dark");

      divRef.current.hasChildNodes() 
      ? divRef.current.replaceChildren(script) 
      : divRef.current.appendChild(script);

    },[post_uid]);

    return (
        <div ref={divRef} id="inject-comments-for-uterances"/>
    )
}