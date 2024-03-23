import ThreadCard from "@/components/cards/ThreadCard";
import { fetchPosts } from "@/lib/actions/thread.actions";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs";

export default async function Home() {

  const results = await fetchPosts(1, 30);
  const user = await currentUser();
  
  return (
    <>
      <h1 className="head-text text-left"> Home</h1>

      <section className="mt-9 flex flex-col gap-10">
        { results?.posts?.length === 0 ? (
          <p className="no-result">No Threads found</p>
        ) : (
          <>
          {results?.posts?.map((post) => (
            <ThreadCard 
              key={post.id}
              id={post._id}
              currentUserId= {user?.id || ""}
              parentId={post.parentId}
              content={post.text}
              author={post.athor}
              community={post.community}
              createdAt={post.createdAt}
              comments={post.comments}
            />
          ))}
          </>
        )}
      </section>
    </>
  );
}
