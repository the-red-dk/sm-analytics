import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { mockData } from '../../mockData';
import { AnalyticsApi } from '../../api';
import KeyMetricsCards from '../Widgets/KeyMetricsCards/KeyMetricsCards';
import EngagementChart from '../Widgets/EngagementChart/EngagementChart';
import ContentPerformanceChart from '../Widgets/ContentPerformanceChart/ContentPerformanceChart';
import UserGrowthChart from '../Widgets/UserGrowthChart/UserGrowthChart';
import ActivityFeed from '../Widgets/ActivityFeed/ActivityFeed';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [summary, engagement, contentPerf, userGrowth] = await Promise.all([
          AnalyticsApi.getSummary(),
          AnalyticsApi.getEngagement(),
          AnalyticsApi.getContentPerformance(),
          AnalyticsApi.getUserGrowth(),
        ]);

        const keyMetrics = {
          totalUsers: summary.totals.totalUsers,
          totalPosts: summary.totals.totalPosts,
          totalLikes: summary.totals.totalLikes,
          engagementRate: summary.totals.engagementRate,
        };

        const weeklyEngagement = {
          thisWeek: { likes: summary.weeklyEngagement.thisWeek.likesAndComments, comments: 0, shares: 0 },
          lastWeek: { likes: summary.weeklyEngagement.lastWeek.likesAndComments, comments: 0, shares: 0 },
        };

        const dailyEngagement = engagement.map((e) => ({
          date: e.date,
          likes: Number(e.likes) || 0,
          comments: Number(e.comments) || 0,
          shares: 0,
        }));

        const topPosts = contentPerf.map((p) => ({
          id: p.post_id,
          title: (p.content || '').slice(0, 30) || `Post #${p.post_id}`,
          likes: Number(p.likes) || 0,
          comments: Number(p.comments) || 0,
          shares: 0,
          author: p.username,
          date: '',
        }));

        let totalUsers = 0;
        const userGrowthData = userGrowth.map((u, idx) => {
          const newUsers = Number(u.new_users) || 0;
          totalUsers = idx === 0 ? newUsers : totalUsers + newUsers;
          return { date: u.date, newUsers, totalUsers };
        });

        setData({
          keyMetrics,
          weeklyEngagement,
          dailyEngagement,
          topPosts,
          userGrowth: userGrowthData,
          recentActivities: mockData.recentActivities, // keep mock for now
        });
      } catch (err) {
        console.warn('Falling back to mockData due to API error:', err.message);
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Analytics Dashboard</h2>
        <p>Overview of your social media performance</p>
      </div>

      <div className="dashboard-grid">
        {/* Key Metrics Cards */}
        <div className="grid-item full-width">
          <KeyMetricsCards data={data.keyMetrics} weeklyData={data.weeklyEngagement} />
        </div>

        {/* Daily/Weekly Engagement Chart */}
        <div className="grid-item large">
          <div className="widget">
            <div className="widget-header">
              <h3>Daily Engagement Trends</h3>
              <p>Likes, Comments, and Shares over the last 30 days</p>
            </div>
            <EngagementChart data={data.dailyEngagement} />
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="grid-item medium">
          <div className="widget">
            <div className="widget-header">
              <h3>User Growth</h3>
              <p>New users joining over time</p>
            </div>
            <UserGrowthChart data={data.userGrowth} />
          </div>
        </div>

        {/* Content Performance Chart */}
        <div className="grid-item medium">
          <div className="widget">
            <div className="widget-header">
              <h3>Top Performing Posts</h3>
              <p>Posts with highest engagement</p>
            </div>
            <ContentPerformanceChart data={data.topPosts} />
          </div>
        </div>

        {/* Activity Feed */}
        <div className="grid-item medium">
          <div className="widget">
            <div className="widget-header">
              <h3>Recent Activity</h3>
              <p>Latest user interactions</p>
            </div>
            <ActivityFeed data={data.recentActivities} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;