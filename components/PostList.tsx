
import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';

interface PostListProps {
  posts: BlogPost[];
}

const PostItem: React.FC<{ post: BlogPost; isOpen: boolean; onClick: () => void }> = ({ post, isOpen, onClick }) => {
  return (
    <div className="border-b border-primary">
      <button
        onClick={onClick}
        className="w-full text-left p-4 focus:outline-none hover:bg-primary/50 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-text-primary">{post.title}</h3>
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
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
        hidden={!isOpen}
      >
        <div className="p-4 bg-primary/40 whitespace-pre-wrap text-text-secondary leading-relaxed">
          {post.content}
        </div>
      </div>
    </div>
  );
};

const POSTS_PER_PAGE = 5;

const PostList: React.FC<PostListProps> = ({ posts }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page when posts change
  useEffect(() => {
    setCurrentPage(1);
    setOpenIndex(null);
  }, [posts]);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  const handleItemClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    setOpenIndex(null); // Close accordion items on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-secondary rounded-lg shadow-xl overflow-hidden">
        {currentPosts.map((post, index) => {
          const postIndex = startIndex + index;
          return (
            <PostItem
              key={postIndex}
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
};

export default PostList;