import React from 'react';
import Loader from './Loader';

interface StatusDisplayProps {
    isLoading: boolean;
    progressMessage: string | null;
    error: string | null;
    postsFound: number;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ isLoading, progressMessage, error, postsFound }) => {
    if (isLoading) {
        return (
            <div className="w-full text-center p-4">
                <Loader />
                {progressMessage && (
                    <p className="text-text-secondary mt-2 text-sm sm:text-base animate-pulse">
                        {progressMessage}
                    </p>
                )}
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-4xl p-4 my-4 text-sm text-red-300 bg-red-900/50 rounded-lg" role="alert">
                <span className="font-medium">Error:</span> {error}
            </div>
        );
    }
    
    // Show a message if scraping finished but found no posts.
    if (!isLoading && postsFound === 0 && progressMessage) {
        return (
             <div className="w-full max-w-4xl p-4 my-4 text-sm text-sky-200 bg-sky-900/50 rounded-lg" role="status">
                <span className="font-medium">Notice:</span> {progressMessage}
            </div>
        )
    }

    return null;
};

export default StatusDisplay;
