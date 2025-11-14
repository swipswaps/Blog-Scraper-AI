
import React, { useState, useEffect, useCallback, memo } from 'react';
import { BlogPost } from '../types';
import { POSTS_PER_PAGE } from '../constants';

interface PostListProps {
  posts: BlogPost[];
}

interface PostItemProps {
  post: BlogPost;
  isOpen: boolean;
  onClick: () => void;
}

const PostItem = memo<PostItemProps>(({ post, isOpen, onClick }) => {
  const handleCopyContent = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(post.content).then(() => {
      // Could add a toast notification here
      console.log('Content copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }, [post.content]);

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="border-b border-primary">
      <button
        onClick={onClick}
        className="w-full text-left p-4 focus:outline-none hover:bg-primary/50 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <div className="flex justify-between items-center">
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-semibold text-text-primary">{post.title}</h3>
            {post.date && (
              <p className="text-sm text-text-secondary/70 mt-1">
                {formatDate(post.date)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isOpen && (
              <button
                onClick={handleCopyContent}
                className="p-1.5 hover:bg-primary rounded transition-colors"
                title="Copy content"
                aria-label="Copy post content to clipboard"
              >
                <svg
                  className="w-5 h-5 text-text-secondary hover:text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            )}
            <svg
              className={`w-6 h-6 text-accent transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-4 bg-primary/40 whitespace-pre-wrap text-text-secondary leading-relaxed">
          {post.content}
          <div className="mt-4 pt-4 border-t border-primary/50 text-xs text-text-secondary/70">
            {post.content.length} characters
          </div>
        </div>
      </div>
    </div>
  );
});

const PostList = memo<PostListProps>(({ posts }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page when posts change
  useEffect(() => {
    setCurrentPage(1);
    setOpenIndex(null);
  }, [posts]);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  const handleItemClick = useCallback((index: number) => {
    setOpenIndex(prev => prev === index ? null : index);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    setOpenIndex(null); // Close accordion items on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);

  if (posts.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center p-8 bg-secondary rounded-lg">
        <svg
          className="w-16 h-16 mx-auto text-text-secondary/50 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-text-secondary text-lg">No posts to display</p>
        <p className="text-text-secondary/70 text-sm mt-2">
          Enter a blog URL above and click "Fetch Posts" to get started
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-secondary rounded-lg shadow-xl overflow-hidden">
        {currentPosts.map((post, index) => {
          const postIndex = startIndex + index;
          return (
            <PostItem
              key={`${post.title}-${postIndex}`}
              post={post}
              isOpen={openIndex === postIndex}
              onClick={() => handleItemClick(postIndex)}
            />
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Blog post pagination" className="flex justify-center items-center mt-6 space-x-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-secondary hover:bg-slate-600 text-text-primary rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Go to previous page"
            aria-disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-text-secondary" aria-live="polite" aria-atomic="true">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-secondary hover:bg-slate-600 text-text-primary rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Go to next page"
            aria-disabled={currentPage === totalPages}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
});

PostItem.displayName = 'PostItem';
PostList.displayName = 'PostList';

export default PostList;
