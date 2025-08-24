import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import CommentSheet, { Comment } from "./CommentSheet";

const meta: Meta<typeof CommentSheet> = {
  title: "Components/CommentSheet",
  component: CommentSheet,
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        component: "댓글을 보고 작성할 수 있는 하단 시트 컴포넌트입니다. 모바일에 최적화되어 있으며 드래그로 닫을 수 있습니다.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const CommentSheetWithState = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "김민수",
      initial: "김",
      content: "정말 맛있어 보이네요! 저도 가보고 싶어요.",
      time: "10분 전",
      isReply: false,
    },
    {
      id: "2",
      author: "이영희",
      initial: "이",
      content: "여기 진짜 맛있어요!! 추천합니다 👍",
      time: "15분 전",
      isReply: false,
    },
    {
      id: "3",
      author: "박철수",
      initial: "박",
      content: "@김민수 저도 같이 가요!",
      time: "5분 전",
      isReply: true,
      mentionedUser: "김민수",
    },
  ]);

  const handleSubmitComment = (postId: string | number, parentId?: string | null) => {
    const commentKey = `${postId}-${parentId || 'root'}`;
    const content = newComment[commentKey];
    
    if (!content?.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      author: "나",
      initial: "나",
      content: content,
      time: "방금",
      isReply: !!parentId,
      mentionedUser: parentId ? comments.find(c => c.id === parentId)?.author : null,
    };

    setComments([...comments, newCommentObj]);
    setNewComment(prev => ({ ...prev, [commentKey]: '' }));
    
    if (parentId) {
      setReplyingTo(null);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          padding: '12px 24px',
          background: '#c4a882',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          zIndex: 999
        }}
      >
        댓글 시트 열기
      </button>
      
      <CommentSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        postId="1"
        comments={comments}
        onSubmitComment={handleSubmitComment}
        replyingTo={replyingTo}
        newComment={newComment}
        setNewComment={setNewComment}
        setReplyingTo={setReplyingTo}
      />
    </>
  );
};

export const Default: Story = {
  render: () => <CommentSheetWithState />,
};

export const Empty: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    postId: "1",
    comments: [],
    onSubmitComment: () => {},
    replyingTo: null,
    newComment: {},
    setNewComment: () => {},
    setReplyingTo: () => {},
  },
};

export const ManyComments: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    postId: "1",
    comments: Array.from({ length: 20 }, (_, i) => ({
      id: `comment-${i}`,
      author: `사용자${i + 1}`,
      initial: `사`,
      content: `댓글 내용입니다. ${i + 1}번째 댓글이에요.`,
      time: `${i * 5 + 1}분 전`,
      isReply: i % 3 === 2,
      mentionedUser: i % 3 === 2 ? `사용자${i}` : null,
    })),
    onSubmitComment: () => {},
    replyingTo: null,
    newComment: {},
    setNewComment: () => {},
    setReplyingTo: () => {},
  },
};