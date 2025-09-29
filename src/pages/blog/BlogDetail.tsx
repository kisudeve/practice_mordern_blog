import { useParams, Link, useNavigate } from "react-router";
import {
  Calendar,
  Tag,
  ArrowLeft,
  Share2,
  Edit,
  Delete,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import supabase from "../../utils/supabase";
import type { Database } from "../../types/database";
import { formatJoined } from "../../utils/date";
import BlogDetailSkeleton from "../../components/loading/BlogDetailSkeleton";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type PostWithProfile = Post & {
  profile: Profile | null;
};

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostWithProfile | null>(null);
  const [postCount, setPostCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", Number(post?.id));
      if (error) throw error;
    } catch (e) {
      console.error(e);
    } finally {
      navigate("/blog");
      // setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // 특정 게시글 정보 먼저 가져오기
        const { data: post, error } = await supabase
          .from("posts")
          .select(
            ` *,
      profile:profiles ( id, display_name, avatar_url, bio, email, created_at )`
          )
          .eq("id", Number(id))
          .single();

        if (error) throw error;
        setPost(post);

        // 같은 작성자의 글 갯수 카운트
        const { count, error: countError } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true }) // head:true => 실제 데이터는 안 가져오고 count만
          .eq("profile_id", post?.profile?.id || "");
        if (countError) throw countError;

        setPostCount(count!);
      } catch (e) {
        console.error(e);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    fetchPosts();
  }, [id]);

  if (isLoading) return <BlogDetailSkeleton />;
  return (
    <div>
      <div className="mb-8">
        <Link
          to="/blog"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Blog
        </Link>
      </div>

      <article>
        <header className="mb-8">
          <div className="relative overflow-hidden rounded-lg mb-6">
            <div
              className={`absolute inset-0 bg-gradient-to-br  opacity-90`}
            ></div>
            <img
              src={post?.thumbnail || undefined}
              alt={post?.thumbnail || undefined}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-black opacity-20"></div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              {post?.created_at &&
                new Date(post.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
            </div>
            <div className="flex items-center">
              <Tag size={14} className="mr-1" />
              {post?.category}
            </div>
            <span>0</span>
            <span>by {post?.profile?.display_name}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {post?.title}
          </h1>

          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-4">
              <Link
                to={`/blog/edit/${post?.id}`}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Link>
              <button
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setShowDeleteModal(true)}
              >
                <Delete size={16} className="mr-2" />
                Delete
              </button>
            </div>
            <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <Share2 size={16} className="mr-2" />
              Share
            </button>
          </div>
        </header>

        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post?.content as string }}
        />

        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <img
                src={post?.profile?.avatar_url || undefined}
                alt={post?.profile?.display_name || undefined}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {post?.profile?.display_name}
                </h3>
                <p className="text-gray-600 mb-2">
                  <strong>{post?.profile?.display_name}</strong> is a frontend
                  {post?.profile?.bio}
                </p>
                <div className="flex space-x-4 text-sm text-gray-500">
                  <span>{postCount} articles published</span>
                  <span>•</span>
                  <span>
                    {" "}
                    {post?.created_at ? formatJoined(post.created_at) : null}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </article>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Post
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "<strong>{post?.title}</strong>
                "? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
