import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import CommentSheet, { Comment } from '../CommentSheet/CommentSheet';
import { GET_COMMENTS } from '../../lib/graphql/queries';
import { CREATE_COMMENT, DELETE_COMMENT } from '../../lib/graphql/mutations';

interface CommentSheetContainerProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | null;
}

const CommentSheetContainer: React.FC<CommentSheetContainerProps> = ({
  isOpen,
  onClose,
  postId,
}) => {
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // 댓글 데이터 조회
  const { data, loading, refetch } = useQuery(GET_COMMENTS, {
    variables: {
      postId: postId || '',
      limit: 100,
      offset: 0,
    },
    skip: !postId,
  });

  // 댓글 생성 뮤테이션
  const [createCommentMutation] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      refetch();
    },
    onError: (err) => {
      console.error('Failed to create comment:', err);
      alert('댓글 작성에 실패했습니다.');
    },
  });

  // 댓글 삭제 뮤테이션
  const [deleteCommentMutation] = useMutation(DELETE_COMMENT, {
    onCompleted: () => {
      refetch();
    },
    onError: (err) => {
      console.error('Failed to delete comment:', err);
      alert('댓글 삭제에 실패했습니다.');
    },
  });

  // 시간 포맷 함수
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '방금';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    return `${Math.floor(diffInSeconds / 604800)}주 전`;
  };

  // 백엔드 데이터를 CommentSheet 형식으로 변환
  const comments: Comment[] = (data?.comments?.comments || []).map((comment: any) => ({
    id: comment.id,
    author: comment.author.name,
    initial: comment.author.initial,
    content: comment.content,
    time: formatTimeAgo(comment.createdAt),
    isReply: comment.isReply,
    mentionedUser:
      comment.mentions && comment.mentions.length > 0
        ? comment.mentions[0].name
        : null,
  }));

  // 댓글 작성
  const handleSubmitComment = async (
    postId: string | number,
    parentId?: string | null
  ) => {
    const commentText = newComment[`${postId}-${parentId || 'root'}`];
    if (!commentText?.trim()) return;

    // 멘션 추출
    const mentionMatches = commentText.match(/@(\S+)/g);
    const mentionedUserIds: string[] = [];

    if (mentionMatches && parentId) {
      // 부모 댓글의 작성자 ID 찾기
      const parentComment = comments.find((c) => c.id === parentId);
      if (parentComment) {
        const parentCommentData = data?.comments?.comments.find(
          (c: any) => c.id === parentId
        );
        if (parentCommentData) {
          mentionedUserIds.push(parentCommentData.author.id);
        }
      }
    }

    try {
      await createCommentMutation({
        variables: {
          input: {
            postId: postId.toString(),
            content: commentText,
            parentCommentId: parentId || null,
            mentionedUserIds: mentionedUserIds.length > 0 ? mentionedUserIds : null,
          },
        },
      });

      // 입력 필드 초기화
      setNewComment((prev) => ({
        ...prev,
        [`${postId}-${parentId || 'root'}`]: '',
      }));

      if (parentId) {
        setReplyingTo(null);
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  };

  if (!postId) return null;

  return (
    <CommentSheet
      isOpen={isOpen}
      onClose={onClose}
      postId={postId}
      comments={comments}
      onSubmitComment={handleSubmitComment}
      replyingTo={replyingTo}
      newComment={newComment}
      setNewComment={setNewComment}
      setReplyingTo={setReplyingTo}
    />
  );
};

export default CommentSheetContainer;
