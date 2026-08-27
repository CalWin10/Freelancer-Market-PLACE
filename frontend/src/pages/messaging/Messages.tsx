import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Icon from "../../components/common/Icon";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../services/api";
import { getMessages, sendMessage, type MessageResponse } from "../../services/messageService";
import { getProject } from "../../services/projectService";
import { formatDateTime } from "../../utils/format";

export default function ProjectMessages() {
  const { id } = useParams();
  const projectId = Number(id);
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projectTitle, setProjectTitle] = useState("");
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadConversation = useCallback(async (background = false) => {
    if (!Number.isSafeInteger(projectId) || projectId <= 0) {
      setError("This conversation link is invalid.");
      setLoading(false);
      return;
    }

    background ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const [project, response] = await Promise.all([
        getProject(projectId),
        getMessages(projectId),
      ]);
      setProjectTitle(project.title);
      setMessages(response);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "This conversation could not be loaded."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => { void loadConversation(); }, [loadConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: messages.length > 1 ? "smooth" : "auto" });
  }, [messages]);

  const submitMessage = async () => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    if (trimmed.length > 4000) {
      setSendError("Message cannot exceed 4,000 characters.");
      return;
    }

    setSending(true);
    setSendError("");
    try {
      const response = await sendMessage(projectId, trimmed);
      setMessages((current) => [...current, response]);
      setContent("");
      textareaRef.current?.focus();
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, "Your message could not be sent.");
      setSendError(message);
      showToast({ type: "error", title: "Message not sent", message });
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void submitMessage();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitMessage();
    }
  };

  if (loading) return <Loader fullPage label="Loading project messages" />;
  if (error) {
    return (
      <div className="page-container page-container--narrow">
        <ErrorState
          action={<Link className="button button--secondary button--md" to={Number.isSafeInteger(projectId) ? `/projects/${projectId}` : "/projects"}>Back to project</Link>}
          message={error}
          onRetry={() => loadConversation()}
          title="Conversation unavailable"
        />
      </div>
    );
  }

  return (
    <div className="page-container page-container--conversation">
      <section className="conversation" aria-label={`Messages for ${projectTitle}`}>
        <header className="conversation__header">
          <Link className="icon-button" to={`/projects/${projectId}`} aria-label="Back to project">
            <Icon name="arrow-left" size={20} />
          </Link>
          <div className="conversation__project-icon"><Icon name="briefcase" size={20} /></div>
          <div className="conversation__title">
            <h1>{projectTitle || `Project #${projectId}`}</h1>
            <span>Shared project conversation</span>
          </div>
          <Button
            aria-label="Refresh messages"
            leftIcon={<Icon name="refresh" size={16} />}
            loading={refreshing}
            onClick={() => loadConversation(true)}
            size="sm"
            variant="ghost"
          >
            Refresh
          </Button>
        </header>

        <div className="conversation__messages" aria-live="polite" aria-relevant="additions text">
          {messages.length === 0 ? (
            <EmptyState compact description="Start the conversation by sharing a project update or question." icon="message" title="No messages yet" />
          ) : (
            messages.map((message, index) => {
              const isMine = message.senderEmail === user?.email;
              const previous = messages[index - 1];
              const showSender = !previous || previous.senderEmail !== message.senderEmail;
              return (
                <article className={`message-row${isMine ? " message-row--mine" : ""}`} key={message.id}>
                  {!isMine && <Avatar className={showSender ? "" : "avatar--invisible"} name={message.senderName} size="xs" />}
                  <div className="message-group">
                    {showSender && <span className="message-group__sender">{isMine ? "You" : message.senderName}</span>}
                    <div className="message-bubble">
                      <p>{message.content}</p>
                      <time dateTime={message.sentAt}>{formatDateTime(message.sentAt)}</time>
                    </div>
                  </div>
                </article>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form className="message-composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="message-content">Message</label>
          <div className={`message-composer__control${sendError ? " message-composer__control--invalid" : ""}`}>
            <textarea
              aria-describedby={sendError ? "message-error" : "message-hint"}
              aria-invalid={Boolean(sendError) || undefined}
              disabled={sending}
              id="message-content"
              maxLength={4000}
              onChange={(event) => { setContent(event.target.value); setSendError(""); }}
              onKeyDown={handleKeyDown}
              placeholder="Write a message…"
              ref={textareaRef}
              rows={2}
              value={content}
            />
            <Button
              aria-label="Send message"
              disabled={!content.trim()}
              loading={sending}
              leftIcon={<Icon name="send" size={17} />}
              type="submit"
            >
              Send
            </Button>
          </div>
          <div className="message-composer__meta">
            {sendError ? <span className="form-error" id="message-error" role="alert">{sendError}</span> : <span id="message-hint">Enter to send · Shift + Enter for a new line</span>}
            <span>{content.length.toLocaleString()} / 4,000</span>
          </div>
        </form>
      </section>
    </div>
  );
}
