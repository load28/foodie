import { Send, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Avatar from "../Avatar/Avatar";
import "./CommentSheet.scss";

export interface Comment {
  id: string;
  author: string;
  initial: string;
  content: string;
  time: string;
  isReply?: boolean;
  mentionedUser?: string | null;
}

interface CommentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | number | null;
  comments?: Comment[];
  onSubmitComment: (postId: string | number, parentId?: string | null) => void;
  replyingTo?: string | null;
  newComment: Record<string, string>;
  setNewComment: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setReplyingTo: React.Dispatch<React.SetStateAction<string | null>>;
}

const CommentSheet: React.FC<CommentSheetProps> = ({
  isOpen,
  onClose,
  postId,
  comments = [],
  onSubmitComment,
  replyingTo,
  newComment,
  setNewComment,
  setReplyingTo,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(70);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 모바일 포커스 강제 함수
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.style.transform = "translateZ(0)";
      inputRef.current.focus();

      if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        inputRef.current.click();
        const touchStart = new TouchEvent("touchstart", { bubbles: true });
        const touchEnd = new TouchEvent("touchend", { bubbles: true });
        inputRef.current.dispatchEvent(touchStart);
        inputRef.current.dispatchEvent(touchEnd);
      }
    }
  };

  // 드래그 시작
  const handleTouchStart = (e: React.TouchEvent) => {
    if (contentRef.current && contentRef.current.contains(e.target as Node)) {
      return;
    }
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  // 드래그 중
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const touchY = e.touches[0].clientY;
    const deltaY = touchY - startY;

    setCurrentY(touchY);

    if (deltaY > 0) {
      const adjustedDelta = deltaY * 0.3;
      const dragPercentage = (adjustedDelta / window.innerHeight) * 100;
      const newHeight = Math.max(50, 70 - dragPercentage);
      setSheetHeight(newHeight);
    }
  };

  // 드래그 종료
  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = currentY - startY;

    if (deltaY > 150 && sheetHeight < 55) {
      onClose();
    } else {
      setSheetHeight(70);
    }
  };

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 시트 닫힐 때 높이 초기화
  useEffect(() => {
    if (!isOpen) {
      setSheetHeight(70);
    }
  }, [isOpen]);

  const handleReplyClick = (comment: Comment) => {
    if (replyingTo === comment.id) {
      setReplyingTo(null);
      setNewComment((prev) => ({
        ...prev,
        [`${postId}-${comment.id}`]: "",
      }));
    } else {
      setReplyingTo(comment.id);
      const mentionText = `@${comment.author} `;
      setNewComment((prev) => ({
        ...prev,
        [`${postId}-${comment.id}`]: mentionText,
      }));

      requestAnimationFrame(() => {
        focusInput();
        setTimeout(() => {
          if (inputRef.current && inputRef.current.setSelectionRange) {
            inputRef.current.setSelectionRange(
              mentionText.length,
              mentionText.length
            );
          }
        }, 50);
      });
    }
  };

  const handleCommentSubmit = () => {
    onSubmitComment(postId!, replyingTo);
  };

  const commentInputKey = `${postId}-${replyingTo || "root"}`;
  const commentValue = newComment[commentInputKey] || "";

  if (!isOpen) return null;

  return (
    <div className="ds-comment-sheet__overlay">
      <div
        ref={sheetRef}
        className={`ds-comment-sheet ${
          isDragging ? "ds-comment-sheet--dragging" : ""
        }`}
        style={{ height: `${sheetHeight}vh` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 드래그 핸들 */}
        <div className="ds-comment-sheet__handle" />

        {/* 댓글 시트 헤더 */}
        <div className="ds-comment-sheet__header">
          <h3 className="ds-comment-sheet__title">댓글</h3>
          <button
            className="ds-comment-sheet__close"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* 댓글 목록 */}
        <div
          ref={contentRef}
          className="ds-comment-sheet__content"
          data-comment-scroll
        >
          {comments.length === 0 ? (
            <div className="ds-comment-sheet__empty">
              아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
            </div>
          ) : (
            <div className="ds-comment-sheet__comments">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`ds-comment ${
                    comment.isReply ? "ds-comment--reply" : ""
                  }`}
                >
                  <Avatar
                    size="small"
                    color="secondary"
                    className="ds-comment__avatar"
                  />

                  <div className="ds-comment__content-wrapper">
                    <div className="ds-comment__author">{comment.author}</div>
                    <div className="ds-comment__content">{comment.content}</div>

                    <div className="ds-comment__meta">
                      {!comment.isReply && (
                        <button
                          onClick={() => handleReplyClick(comment)}
                          className={`ds-comment__reply-btn ${
                            replyingTo === comment.id
                              ? "ds-comment__reply-btn--active"
                              : ""
                          }`}
                        >
                          답글
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 댓글 입력 */}
        <div className="ds-comment-sheet__input-area">
          {/* 답글 모드 메타정보 */}
          {replyingTo && (
            <div className="ds-comment-sheet__reply-info">
              <span className="ds-comment-sheet__reply-text">
                <span className="ds-comment-sheet__reply-target">
                  {comments.find((c) => c.id === replyingTo)?.author}
                </span>
                님에게 답글 작성 중
              </span>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setNewComment((prev) => ({
                    ...prev,
                    [`${postId}-${replyingTo}`]: "",
                  }));
                }}
                className="ds-comment-sheet__reply-cancel"
                aria-label="답글 취소"
              >
                ×
              </button>
            </div>
          )}

          <div className="ds-comment-sheet__input-wrapper">
            <Avatar size="medium" color="primary" />

            <div className="ds-comment-sheet__input-group">
              <input
                ref={inputRef}
                type="text"
                className="ds-comment-sheet__input"
                placeholder={
                  replyingTo ? "답글을 입력하세요..." : "댓글을 입력하세요..."
                }
                value={commentValue}
                onChange={(e) =>
                  setNewComment((prev) => ({
                    ...prev,
                    [commentInputKey]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />

              <button
                onClick={handleCommentSubmit}
                disabled={!commentValue.trim()}
                className={`ds-comment-sheet__send ${
                  commentValue.trim() ? "ds-comment-sheet__send--active" : ""
                }`}
                aria-label="전송"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSheet;
