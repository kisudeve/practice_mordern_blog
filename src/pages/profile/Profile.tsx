import { useEffect, useState } from "react";
import { Calendar, Edit3, Save, X } from "lucide-react";
import supabase from "../../utils/supabase";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../../stores/authStore";
import ProfileSkeleton from "../../components/loading/ProfileSkeleton";
import type { Database } from "../../types/database";
// import ProfileSkeleton from "../../components/loading/ProfileSkeleton";
type Post = Database["public"]["Tables"]["posts"]["Row"];
export default function Profile() {
  const naviagate = useNavigate();
  const profile = useAuthStore((state) => state?.profile);
  const isLoading = useAuthStore((state) => state?.isLoading);
  const setProfile = useAuthStore((state) => state.setProfile);
  const [posts, setPosts] = useState<(Post | null)[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Profile> | null>(profile);

  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ ...editForm })
        .eq("id", profile?.id || "")
        .select()
        .single();
      if (error) throw error;
      console.log(data);
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    naviagate("/");
  };
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data: posts, error } = await supabase
          .from("posts")
          .select(` *`)
          .eq("profile_id", profile?.id || "")
          .order("created_at", { ascending: false }); // 최신 글이 맨 위

        if (error) throw error;
        setPosts(posts);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPosts();
  }, [profile?.id]);
  if (isLoading) return <ProfileSkeleton />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <img
                src={profile?.avatar_url || ""}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h2 className="text-xl font-bold text-gray-900">
                {profile?.display_name}
              </h2>
              <p className="text-gray-600">{profile?.email}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Calendar size={16} className="mr-3" />
                <span>
                  Joined{" "}
                  {new Date(profile?.created_at || "").toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <Edit3 size={16} className="mr-3" />
                <span>0 posts published</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
              >
                Edit Profile
              </button>
              <button
                className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors mt-2.5"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">About</h3>
              {isEditing && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    <Save size={14} className="mr-1" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                  >
                    <X size={14} className="mr-1" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm?.display_name || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, display_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm?.email || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editForm?.bio || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed">{profile?.bio}</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Recent Posts
            </h3>
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  key={post?.id}
                  to={`/blog/${post?.id}`}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{post?.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(post?.created_at || "").toLocaleDateString()}
                    </p>
                  </div>
                  {/* 추천 디자인 bg-yellow-100 text-yellow-800 */}
                  <span
                    className={`px-2 py-1 text-xs rounded-full bg-green-100 text-green-800`}
                  >
                    Published
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
