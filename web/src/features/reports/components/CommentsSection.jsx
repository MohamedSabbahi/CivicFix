import { memo, useCallback } from 'react';
import { MessageCircle, Send, Loader2, User } from 'lucide-react';
import { formatDate } from '../utils/reportUtils';
const CommentsSection = memo(({
  comments,
  commentsLoading,
  newComment,
  onCommentChange,
  onAddComment,
  isSubmitting,
}) => {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onAddComment();
      }
    },
    [onAddComment],
  );

  return (
    <section
      className="bg-white/[0.02] rounded-2xl p-6 lg:p-8 border border-white/[0.08] w-full"
      aria-labelledby="comments-heading"
    >
      <div className="flex items-center justify-between mb-6">
        <h3
          id="comments-heading"
          className="text-lg font-semibold text-white flex items-center gap-2"
        >
          <MessageCircle size={20} aria-hidden="true" />
          Comments
        </h3>
        <span className="text-sm text-white/40" aria-live="polite">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      <div className="flex gap-3 mb-6 w-full">
        <label htmlFor="comment-input" className="sr-only">
          Add a comment
        </label>
        <input
          id="comment-input"
          type="text"
          value={newComment}
          onChange={(e) => onCommentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment…"
          disabled={isSubmitting}
          className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10
                    text-white placeholder-white/40 focus:outline-none focus:ring-2
                    focus:ring-blue-500/50 disabled:opacity-50 transition-opacity"
        />
        <button
          onClick={onAddComment}
          disabled={isSubmitting || !newComment.trim()}
          aria-label="Submit comment"
          className="px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white
                    transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? <Loader2 size={20} className="animate-spin" aria-label="Submitting…" />
            : <Send size={20} aria-hidden="true" />}
        </button>
      </div>

      {commentsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-blue-500" aria-label="Loading comments" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center py-8 text-white/40">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <ul className="space-y-4 w-full" aria-label="Comments list">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="flex gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]"
            >
              <div
                className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <User size={18} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-white">
                    {comment.user?.name || 'Anonymous'}
                  </span>
                  <time
                    className="text-xs text-white/40"
                    dateTime={comment.createdAt}
                  >
                    {formatDate(comment.createdAt)}
                  </time>
                </div>
                <p className="text-white/70 whitespace-pre-wrap break-words">
                  {comment.text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
});

CommentsSection.displayName = 'CommentsSection';

export default CommentsSection;