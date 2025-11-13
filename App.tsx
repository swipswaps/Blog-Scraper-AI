import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { BlogPost, ProgressUpdate } from './types';
import PostList from './components/PostList';
import StatusDisplay from './components/StatusDisplay';
import { scrapeBlogPosts } from './services/geminiService';
import { validateAndNormalizeUrl, validatePostLimit } from './utils/validation';
import { downloadPostsAsCsv, downloadPostsAsJson } from './utils/download';
import { DEFAULT_BLOG_URL, DEFAULT_POST_LIMIT } from './constants';

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const App: React.FC = () => {
    const [blogUrl, setBlogUrl] = useState<string>(DEFAULT_BLOG_URL);
    const [postLimit, setPostLimit] = useState<string>(DEFAULT_POST_LIMIT);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [progressMessage, setProgressMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<string>('default');
    const [downloadCount, setDownloadCount] = useState<string>('');

    const handleFetchPosts = useCallback(() => {
        // Validate URL
        const urlValidation = validateAndNormalizeUrl(blogUrl);
        if (!urlValidation.valid) {
            setValidationError(urlValidation.error || 'Invalid URL');
            return;
        }

        // Validate post limit
        const limitValidation = validatePostLimit(postLimit);
        if (!limitValidation.valid) {
            setValidationError(limitValidation.error || 'Invalid limit');
            return;
        }

        // Clear validation errors
        setValidationError(null);
        setPosts([]);
        setError(null);
        setProgressMessage('Initializing...');
        setIsLoading(true);
        setSearchQuery('');
        setSortOrder('default');

        let postCount = 0;

        scrapeBlogPosts(urlValidation.url, {
            limit: limitValidation.limit,
            onProgress: (update: ProgressUpdate) => {
                if (update.type === 'status') {
                    setProgressMessage(update.message);
                } else if (update.type === 'post') {
                    postCount++;
                    setProgressMessage(`Processing posts... Found ${postCount}`);
                    setPosts(prevPosts => [...prevPosts, update.data]);
                }
            },
            onComplete: () => {
                setIsLoading(false);
                if (postCount === 0) {
                    setProgressMessage('No blog posts found. The site structure may not be supported.');
                }
            },
            onError: (err: Error) => {
                setError(err.message || 'An unknown error occurred during scraping.');
                setIsLoading(false);
            },
        });
    }, [blogUrl, postLimit]);

    const sortedPosts = useMemo(() => {
        const sortablePosts = [...posts];
        switch (sortOrder) {
            case 'title-asc':
                return sortablePosts.sort((a, b) => a.title.localeCompare(b.title));
            case 'title-desc':
                return sortablePosts.sort((a, b) => b.title.localeCompare(a.title));
            case 'length-asc':
                return sortablePosts.sort((a, b) => a.content.length - b.content.length);
            case 'length-desc':
                return sortablePosts.sort((a, b) => b.content.length - a.content.length);
            case 'default':
            default:
                return posts;
        }
    }, [posts, sortOrder]);

    const filteredPosts = useMemo(() => {
        if (!searchQuery) return sortedPosts;
        return sortedPosts.filter(post => {
            const query = searchQuery.toLowerCase();
            return (post.title?.toLowerCase().includes(query) || post.content?.toLowerCase().includes(query));
        });
    }, [sortedPosts, searchQuery]);

    const handleDownload = useCallback((format: 'json' | 'csv') => {
        if (filteredPosts.length === 0) return;

        const limit = parseInt(downloadCount, 10);
        const postsToDownload = limit > 0 ? filteredPosts.slice(0, limit) : filteredPosts;

        if (format === 'csv') {
            downloadPostsAsCsv(postsToDownload);
        } else {
            downloadPostsAsJson(postsToDownload);
        }
    }, [filteredPosts, downloadCount]);

    // Keyboard shortcut: Ctrl/Cmd + Enter to fetch posts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isLoading) {
                e.preventDefault();
                handleFetchPosts();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleFetchPosts, isLoading]);

    // Clear validation error when inputs change
    useEffect(() => {
        if (validationError) {
            setValidationError(null);
        }
    }, [blogUrl, postLimit]);

    return (
        <div className="min-h-screen bg-primary flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <header className="w-full max-w-4xl text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-2">
                    Blog Scraper
                </h1>
                <p className="text-lg text-text-secondary">
                    Fetch, filter, and download blog posts from a URL.
                </p>
                <p className="text-sm text-text-secondary mt-2 opacity-75">
                    💡 Tip: Press <kbd className="px-2 py-1 bg-secondary rounded text-xs">Ctrl+Enter</kbd> to fetch posts
                </p>
            </header>

            <main className="w-full max-w-4xl flex-grow flex flex-col items-center">
                <div className="w-full bg-secondary p-4 sm:p-6 rounded-lg shadow-xl mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label htmlFor="blog-url" className="block text-sm font-medium text-text-secondary mb-1">
                                Blog URL
                            </label>
                            <input
                                type="url"
                                id="blog-url"
                                value={blogUrl}
                                onChange={(e) => setBlogUrl(e.target.value)}
                                placeholder="https://example.com/blog"
                                className="bg-primary border border-slate-600 text-text-primary text-md rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5 transition"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                             <label htmlFor="post-limit" className="block text-sm font-medium text-text-secondary mb-1">
                                Post Limit
                            </label>
                            <input
                                type="number"
                                id="post-limit"
                                min="1"
                                value={postLimit}
                                onChange={(e) => setPostLimit(e.target.value)}
                                placeholder="All"
                                className="bg-primary border border-slate-600 text-text-primary text-md rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5 transition"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <button
                                onClick={handleFetchPosts}
                                disabled={isLoading}
                                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-accent hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Fetching Posts...' : 'Fetch Posts'}
                            </button>
                        </div>
                    </div>
                </div>

                {validationError && (
                    <div className="w-full max-w-4xl p-4 my-4 text-sm text-yellow-300 bg-yellow-900/50 rounded-lg" role="alert">
                        <span className="font-medium">Validation Error:</span> {validationError}
                    </div>
                )}

                <StatusDisplay
                    isLoading={isLoading}
                    progressMessage={progressMessage}
                    error={error}
                    postsFound={posts.length}
                />
                
                {posts.length > 0 && !isLoading && (
                    <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
                        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                             <h2 className="text-2xl font-semibold text-left w-full md:w-auto shrink-0">
                                Results ({filteredPosts.length})
                            </h2>
                             <div className="w-full flex flex-col sm:flex-row justify-end items-center gap-3">
                                <div className="relative w-full sm:w-auto">
                                    <label htmlFor="sort-order" className="sr-only">Sort posts by</label>
                                    <select
                                        id="sort-order"
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="bg-primary border border-slate-600 text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5 transition appearance-none pr-8 bg-no-repeat"
                                        style={{
                                            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>')`,
                                            backgroundPosition: 'right 0.5rem center',
                                            backgroundSize: '1.5em 1.5em',
                                        }}
                                    >
                                        <option value="default">Default Order</option>
                                        <option value="title-asc">Title (A-Z)</option>
                                        <option value="title-desc">Title (Z-A)</option>
                                        <option value="length-asc">Length (Shortest)</option>
                                        <option value="length-desc">Length (Longest)</option>
                                    </select>
                                </div>
                                <div className="relative w-full sm:w-auto flex-grow max-w-xs">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <SearchIcon className="h-5 w-5 text-text-secondary" />
                                    </div>
                                    <input
                                        type="search"
                                        aria-label="Filter posts by title or content"
                                        placeholder="Filter posts..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-primary border border-slate-600 text-text-primary text-md rounded-lg focus:ring-accent focus:border-accent block w-full pl-10 p-2.5 transition"
                                    />
                                </div>
                                <div className="hidden sm:block border-l border-slate-600 h-8 mx-1"></div>
                                <div className="relative w-full sm:w-24">
                                    <label htmlFor="download-count" className="sr-only">Number of posts to download</label>
                                    <input
                                        type="number"
                                        id="download-count"
                                        min="1"
                                        aria-label="Number of posts to download"
                                        placeholder="All"
                                        value={downloadCount}
                                        onChange={(e) => setDownloadCount(e.target.value)}
                                        className="bg-primary border border-slate-600 text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5 transition"
                                    />
                                </div>
                                <button
                                    onClick={() => handleDownload('csv')}
                                    className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent transition-all duration-200"
                                    title="Download as CSV"
                                >
                                    <DownloadIcon className="h-5 w-5 sm:mr-2" />
                                    <span className="hidden sm:inline">CSV</span>
                                </button>
                                <button
                                    onClick={() => handleDownload('json')}
                                    className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-green-500 transition-all duration-200"
                                    title="Download as JSON"
                                >
                                    <DownloadIcon className="h-5 w-5 sm:mr-2" />
                                    <span className="hidden sm:inline">JSON</span>
                                </button>
                            </div>
                        </div>
                        <PostList posts={filteredPosts} />
                    </div>
                )}
            </main>
             <footer className="w-full max-w-4xl text-center mt-8 text-text-secondary text-sm">
                <p>For personal and educational use.</p>
            </footer>
        </div>
    );
};

export default App;