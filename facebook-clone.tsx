import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Globe, Settings, Users, FileText, LogOut, Trash2, Edit } from 'lucide-react';

export default function FacebookClone() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [signupForm, setSignupForm] = useState({ username: '', password: '', fullName: '' });
  const [newPost, setNewPost] = useState('');
  const [newComment, setNewComment] = useState({});
  const [error, setError] = useState('');
  const [editingPost, setEditingPost] = useState(null);

  // Load data from storage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const usersResult = await window.storage.get('fb_users', true);
      const postsResult = await window.storage.get('fb_posts', true);
      
      if (usersResult) {
        const loadedUsers = JSON.parse(usersResult.value);
        setUsers(loadedUsers);
        
        // Create admin account if it doesn't exist
        if (!loadedUsers.find(u => u.username === 'admin')) {
          const adminUser = {
            id: 'admin',
            username: 'admin',
            password: 'admin123',
            fullName: 'Administrator',
            isAdmin: true,
            avatar: '👑'
          };
          const updatedUsers = [...loadedUsers, adminUser];
          setUsers(updatedUsers);
          await window.storage.set('fb_users', JSON.stringify(updatedUsers), true);
        }
      } else {
        // Initialize with admin account
        const adminUser = {
          id: 'admin',
          username: 'admin',
          password: 'admin123',
          fullName: 'Administrator',
          isAdmin: true,
          avatar: '👑'
        };
        setUsers([adminUser]);
        await window.storage.set('fb_users', JSON.stringify([adminUser]), true);
      }

      if (postsResult) {
        setPosts(JSON.parse(postsResult.value));
      }
    } catch (err) {
      console.log('First time setup');
      const adminUser = {
        id: 'admin',
        username: 'admin',
        password: 'admin123',
        fullName: 'Administrator',
        isAdmin: true,
        avatar: '👑'
      };
      setUsers([adminUser]);
      await window.storage.set('fb_users', JSON.stringify([adminUser]), true);
    }
  };

  const handleLogin = () => {
    setError('');
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setView('feed');
      setLoginForm({ username: '', password: '' });
    } else {
      setError('Invalid username or password');
    }
  };

  const handleSignup = async () => {
    setError('');
    if (!signupForm.username || !signupForm.password || !signupForm.fullName) {
      setError('All fields are required');
      return;
    }
    if (users.find(u => u.username === signupForm.username)) {
      setError('Username already exists');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      username: signupForm.username,
      password: signupForm.password,
      fullName: signupForm.fullName,
      isAdmin: false,
      avatar: '👤'
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    await window.storage.set('fb_users', JSON.stringify(updatedUsers), true);
    setCurrentUser(newUser);
    setView('feed');
    setSignupForm({ username: '', password: '', fullName: '' });
  };

  const handlePost = async () => {
    if (newPost.trim()) {
      const post = {
        id: Date.now().toString(),
        authorId: currentUser.id,
        author: currentUser.fullName,
        avatar: currentUser.avatar,
        username: currentUser.username,
        timestamp: new Date().toISOString(),
        content: newPost,
        likes: [],
        comments: [],
        shares: 0
      };
      
      const updatedPosts = [post, ...posts];
      setPosts(updatedPosts);
      await window.storage.set('fb_posts', JSON.stringify(updatedPosts), true);
      setNewPost('');
    }
  };

  const handleLike = async (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const likes = post.likes || [];
        const hasLiked = likes.includes(currentUser.id);
        return {
          ...post,
          likes: hasLiked 
            ? likes.filter(id => id !== currentUser.id)
            : [...likes, currentUser.id]
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    await window.storage.set('fb_posts', JSON.stringify(updatedPosts), true);
  };

  const handleComment = async (postId) => {
    if (newComment[postId]?.trim()) {
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, {
              id: Date.now().toString(),
              authorId: currentUser.id,
              author: currentUser.fullName,
              avatar: currentUser.avatar,
              text: newComment[postId],
              timestamp: new Date().toISOString()
            }]
          };
        }
        return post;
      });
      setPosts(updatedPosts);
      await window.storage.set('fb_posts', JSON.stringify(updatedPosts), true);
      setNewComment({ ...newComment, [postId]: '' });
    }
  };

  const deletePost = async (postId) => {
    const updatedPosts = posts.filter(p => p.id !== postId);
    setPosts(updatedPosts);
    await window.storage.set('fb_posts', JSON.stringify(updatedPosts), true);
  };

  const deleteUser = async (userId) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    await window.storage.set('fb_users', JSON.stringify(updatedUsers), true);
    
    const updatedPosts = posts.filter(p => p.authorId !== userId);
    setPosts(updatedPosts);
    await window.storage.set('fb_posts', JSON.stringify(updatedPosts), true);
  };

  const updatePost = async (postId, newContent) => {
    const updatedPosts = posts.map(post =>
      post.id === postId ? { ...post, content: newContent, edited: true } : post
    );
    setPosts(updatedPosts);
    await window.storage.set('fb_posts', JSON.stringify(updatedPosts), true);
    setEditingPost(null);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Login Page
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-blue-600 mb-2">facebook</h1>
            <p className="text-gray-600">Connect with friends and the world around you</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <input
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 outline-none focus:border-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 outline-none focus:border-blue-500"
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mb-3"
            >
              Log In
            </button>
            <hr className="my-4" />
            <button
              onClick={() => setView('signup')}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600"
            >
              Create New Account
            </button>
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
              <p className="font-semibold text-blue-900">Admin Account:</p>
              <p className="text-blue-700">Username: admin</p>
              <p className="text-blue-700">Password: admin123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signup Page
  if (view === 'signup') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-blue-600 mb-2">facebook</h1>
            <p className="text-2xl font-semibold mb-2">Create a new account</p>
            <p className="text-gray-600">It's quick and easy.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <input
              type="text"
              placeholder="Full Name"
              value={signupForm.fullName}
              onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Username"
              value={signupForm.username}
              onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 outline-none focus:border-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={signupForm.password}
              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSignup()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 outline-none focus:border-blue-500"
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              onClick={handleSignup}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 mb-3"
            >
              Sign Up
            </button>
            <button
              onClick={() => { setView('login'); setError(''); }}
              className="w-full text-blue-600 hover:underline"
            >
              Already have an account?
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Panel
  if (view === 'admin' && currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
            <div className="flex gap-2">
              <button onClick={() => setView('feed')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Back to Feed
              </button>
              <button onClick={() => { setCurrentUser(null); setView('login'); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Users className="text-blue-600" size={32} />
                <div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <FileText className="text-green-600" size={32} />
                <div>
                  <p className="text-gray-500 text-sm">Total Posts</p>
                  <p className="text-3xl font-bold">{posts.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <MessageCircle className="text-purple-600" size={32} />
                <div>
                  <p className="text-gray-500 text-sm">Total Comments</p>
                  <p className="text-3xl font-bold">{posts.reduce((acc, p) => acc + p.comments.length, 0)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Users Management</h2>
            </div>
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Avatar</th>
                    <th className="text-left py-2">Full Name</th>
                    <th className="text-left py-2">Username</th>
                    <th className="text-left py-2">Role</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b">
                      <td className="py-3 text-2xl">{user.avatar}</td>
                      <td className="py-3">{user.fullName}</td>
                      <td className="py-3">{user.username}</td>
                      <td className="py-3">{user.isAdmin ? '👑 Admin' : 'User'}</td>
                      <td className="py-3">
                        {user.id !== 'admin' && (
                          <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Posts Management</h2>
            </div>
            <div className="p-4 space-y-4">
              {posts.map(post => (
                <div key={post.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{post.author}</p>
                      <p className="text-sm text-gray-500">{formatTimestamp(post.timestamp)}</p>
                    </div>
                    <button onClick={() => deletePost(post.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-gray-900">{post.content}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    {(post.likes || []).length} likes · {post.comments.length} comments
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // News Feed
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-600">facebook</h1>
          <div className="flex items-center gap-3">
            <span className="font-semibold">{currentUser.fullName}</span>
            <div className="text-2xl">{currentUser.avatar}</div>
            {currentUser.isAdmin && (
              <button onClick={() => setView('admin')} className="p-2 hover:bg-gray-100 rounded-full" title="Admin Panel">
                <Settings size={20} />
              </button>
            )}
            <button onClick={() => { setCurrentUser(null); setView('login'); }} className="p-2 hover:bg-gray-100 rounded-full" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-4 px-4">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl flex-shrink-0">
              {currentUser.avatar}
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-gray-100 rounded-lg px-4 py-2 outline-none resize-none"
                rows="3"
              />
              {newPost && (
                <div className="mt-3">
                  <button onClick={handlePost} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
                    Post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {posts.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>No posts yet. Be the first to share something!</p>
          </div>
        )}

        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow mb-4">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                    {post.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.author}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span>{formatTimestamp(post.timestamp)}</span>
                      {post.edited && <span>· Edited</span>}
                      <span>·</span>
                      <Globe size={12} />
                    </div>
                  </div>
                </div>
                {(currentUser.isAdmin || currentUser.id === post.authorId) && (
                  <div className="flex gap-2">
                    {currentUser.id === post.authorId && (
                      <button onClick={() => setEditingPost(post.id)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                        <Edit size={18} />
                      </button>
                    )}
                    <button onClick={() => deletePost(post.id)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              {editingPost === post.id ? (
                <div className="mt-3">
                  <textarea
                    defaultValue={post.content}
                    className="w-full border rounded-lg p-2"
                    rows="3"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        updatePost(post.id, e.target.value);
                      }
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={(e) => updatePost(post.id, e.target.parentElement.previousElementSibling.value)} className="px-4 py-1 bg-blue-600 text-white rounded">Save</button>
                    <button onClick={() => setEditingPost(null)} className="px-4 py-1 bg-gray-300 rounded">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-gray-900">{post.content}</p>
              )}
            </div>

            <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-t border-gray-100">
              <span>{(post.likes || []).length} {(post.likes || []).length === 1 ? 'like' : 'likes'}</span>
              <span>{post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}</span>
            </div>

            <div className="border-y border-gray-200 px-2 py-1 flex items-center justify-around">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 ${
                  (post.likes || []).includes(currentUser.id) ? 'text-blue-600 font-semibold' : 'text-gray-600'
                }`}
              >
                <ThumbsUp size={20} fill={(post.likes || []).includes(currentUser.id) ? 'currentColor' : 'none'} />
                <span>Like</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 text-gray-600">
                <MessageCircle size={20} />
                <span>Comment</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 text-gray-600">
                <Share2 size={20} />
                <span>Share</span>
              </button>
            </div>

            <div className="px-4 py-3 bg-gray-50">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    {comment.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-2xl px-3 py-2">
                      <h4 className="font-semibold text-sm">{comment.author}</h4>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-3">{formatTimestamp(comment.timestamp)}</p>
                  </div>
                </div>
              ))}

              <div className="flex gap-2 mt-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  {currentUser.avatar}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment[post.id] || ''}
                    onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-gray-200 rounded-full px-4 py-2 text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}