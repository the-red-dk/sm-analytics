import React, { useState, useEffect } from 'react';
import './ActivityFeed.css';

const ActivityFeed = ({ data }) => {
  const [realtimeActivities, setRealtimeActivities] = useState(data);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    setRealtimeActivities(data);
  }, [data]);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Simulate new activity
      const newActivity = {
        id: Date.now(),
        type: ['new_user', 'new_post', 'like', 'comment'][Math.floor(Math.random() * 4)],
        user: `user${Math.floor(Math.random() * 1000)}`,
        action: 'performed an action',
        time: 'just now',
        avatar: ['👤', '👩‍💼', '👨‍💻', '👩‍🎨', '📸'][Math.floor(Math.random() * 5)],
      };

      setRealtimeActivities(prev => [newActivity, ...prev.slice(0, 7)]);
    }, 10000); // Add new activity every 10 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'new_user':
        return '👤';
      case 'new_post':
        return '📝';
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'share':
        return '🔄';
      default:
        return '📊';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'new_user':
        return 'blue';
      case 'new_post':
        return 'green';
      case 'like':
        return 'red';
      case 'comment':
        return 'purple';
      case 'share':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <div className="activity-feed">
      <div className="activity-header">
        <div className="live-indicator">
          <span className={`live-dot ${isLive ? 'active' : ''}`}></span>
          <span className="live-text">{isLive ? 'Live' : 'Paused'}</span>
          <button 
            className="live-toggle"
            onClick={() => setIsLive(!isLive)}
            title={isLive ? 'Pause live updates' : 'Resume live updates'}
          >
            {isLive ? '⏸️' : '▶️'}
          </button>
        </div>
      </div>
      <div className="activity-list">
        {realtimeActivities.map((activity, index) => (
          <div 
            key={activity.id} 
            className={`activity-item ${index === 0 && activity.time === 'just now' ? 'new-activity' : ''}`}
          >
            <div className={`activity-icon ${getActivityColor(activity.type)}`}>
              <span>{getActivityIcon(activity.type)}</span>
            </div>
            <div className="activity-content">
              <div className="activity-header">
                <span className="user-avatar">{activity.avatar}</span>
                <div className="activity-text">
                  <span className="username">@{activity.user}</span>
                  <span className="action">{activity.action}</span>
                </div>
              </div>
              <div className="activity-time">{activity.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="activity-footer">
        <button className="view-all-btn">
          View All Activities
          <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;