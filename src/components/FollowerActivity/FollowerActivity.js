import React, { useState, useEffect } from 'react';
import './FollowerActivity.css';

const FollowerActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadActivities();
  }, [timeRange]);

  const loadActivities = async () => {
    try {
      // Mock data for now - will be replaced with real API call
      const mockActivities = [
        {
          id: 1,
          type: 'follow',
          follower: 'alice',
          follower_name: 'Alice Johnson',
          followee: 'bob',
          followee_name: 'Bob Smith',
          created_at: '2024-10-12T14:30:00Z'
        },
        {
          id: 2,
          type: 'unfollow',
          follower: 'carol',
          follower_name: 'Carol White',
          followee: 'alice',
          followee_name: 'Alice Johnson',
          created_at: '2024-10-12T13:15:00Z'
        },
        {
          id: 3,
          type: 'follow',
          follower: 'bob',
          follower_name: 'Bob Smith',
          followee: 'carol',
          followee_name: 'Carol White',
          created_at: '2024-10-12T10:45:00Z'
        },
        {
          id: 4,
          type: 'follow',
          follower: 'newuser',
          follower_name: 'New User',
          followee: 'alice',
          followee_name: 'Alice Johnson',
          created_at: '2024-10-11T16:20:00Z'
        },
        {
          id: 5,
          type: 'follow',
          follower: 'photographer',
          follower_name: 'Pro Photographer',
          followee: 'carol',
          followee_name: 'Carol White',
          created_at: '2024-10-11T09:30:00Z'
        }
      ];
      setActivities(mockActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    return filterType === 'all' || activity.type === filterType;
  });

  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'follow':
        return '👤➕';
      case 'unfollow':
        return '👤➖';
      default:
        return '📊';
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'follow':
        return (
          <>
            <strong>@{activity.follower}</strong> started following <strong>@{activity.followee}</strong>
          </>
        );
      case 'unfollow':
        return (
          <>
            <strong>@{activity.follower}</strong> unfollowed <strong>@{activity.followee}</strong>
          </>
        );
      default:
        return 'Unknown activity';
    }
  };

  // Calculate stats
  const stats = {
    total: activities.length,
    follows: activities.filter(a => a.type === 'follow').length,
    unfollows: activities.filter(a => a.type === 'unfollow').length,
    netGrowth: activities.filter(a => a.type === 'follow').length - activities.filter(a => a.type === 'unfollow').length
  };

  if (loading) {
    return (
      <div className="follower-activity">
        <div className="loading">Loading follower activities...</div>
      </div>
    );
  }

  return (
    <div className="follower-activity">
      <div className="page-header">
        <h2>Follower Activity</h2>
        <p>Track follower relationships and activity patterns</p>
      </div>

      <div className="activity-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Activities</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.follows}</div>
            <div className="stat-label">New Follows</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-number">{stats.unfollows}</div>
            <div className="stat-label">Unfollows</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-number">{stats.netGrowth > 0 ? '+' : ''}{stats.netGrowth}</div>
            <div className="stat-label">Net Growth</div>
          </div>
        </div>
      </div>

      <div className="activity-controls">
        <div className="filter-controls">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Activities</option>
            <option value="follow">Follows Only</option>
            <option value="unfollow">Unfollows Only</option>
          </select>
        </div>
        <div className="time-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-select"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="activities-list">
        {filteredActivities.map(activity => (
          <div key={activity.id} className={`activity-item ${activity.type}`}>
            <div className="activity-icon">
              {getActivityIcon(activity.type)}
            </div>
            <div className="activity-content">
              <div className="activity-text">
                {getActivityText(activity)}
              </div>
              <div className="activity-time">
                {formatDate(activity.created_at)}
              </div>
            </div>
            <div className="activity-users">
              <div className="user-avatars">
                <div className="user-avatar follower">
                  {activity.follower.charAt(0).toUpperCase()}
                </div>
                <div className="arrow">→</div>
                <div className="user-avatar followee">
                  {activity.followee.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="empty-state">
          <h3>No activities found</h3>
          <p>No follower activities match your current filters</p>
        </div>
      )}
    </div>
  );
};

export default FollowerActivity;