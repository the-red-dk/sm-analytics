# Power BI Measures & Star Schema

## Star schema (logical)
- Fact tables:
  - fact_posts: from `posts` (grain: post)
  - fact_likes: from `likes` (grain: like event)
  - fact_comments: from `comments` (grain: comment event)
- Dimensions:
  - dim_users: from `users`
  - dim_date: create in Power BI (Calendar table) by date

Relationships:
- fact_posts.user_id -> dim_users.id
- fact_likes.user_id -> dim_users.id; fact_likes.post_id -> fact_posts.id
- fact_comments.user_id -> dim_users.id; fact_comments.post_id -> fact_posts.id
- Each fact table links to dim_date via their created_at date

Alternatively, import ready views:
- `daily_engagement` for trend charts
- `post_likes_agg`, `post_comments_agg` for quick post metrics

## Suggested measures (DAX)
Assume you created model tables named Posts, Likes, Comments, Users, and Date.

- Total Posts:
```
Total Posts = COUNTROWS(Posts)
```

- Total Likes:
```
Total Likes = COUNTROWS(Likes)
```

- Total Comments:
```
Total Comments = COUNTROWS(Comments)
```

- Engagement:
```
Engagement = [Total Likes] + [Total Comments]
```

- Engagement Rate (per post):
```
Engagement Rate % = DIVIDE([Engagement], [Total Posts])
```

- New Users:
```
New Users = COUNTROWS(Users)
```

- Cumulative Users:
```
Cumulative Users = 
CALCULATE(
    [New Users],
    FILTER(
        ALLSELECTED('Date'[Date]),
        'Date'[Date] <= MAX('Date'[Date])
    )
)
```

- Likes (Last 7 Days):
```
Likes (Last 7 Days) = 
CALCULATE(
    [Total Likes],
    DATESINPERIOD('Date'[Date], MAX('Date'[Date]), -7, DAY)
)
```

- Comments (Last 7 Days):
```
Comments (Last 7 Days) = 
CALCULATE(
    [Total Comments],
    DATESINPERIOD('Date'[Date], MAX('Date'[Date]), -7, DAY)
)
```

- Engagement (Last 7 Days):
```
Engagement (Last 7 Days) = [Likes (Last 7 Days)] + [Comments (Last 7 Days)]
```

## Visual ideas
- Line chart: Date vs Posts, Likes, Comments (use `daily_engagement` or measures)
- Bar chart: Top Posts by Engagement (Posts + Likes + Comments)
- Area chart: Cumulative Users over time
- Cards: Total Posts, Total Likes, Total Comments, Engagement Rate %

## Import tips
- Use the MySQL connector; pick `sm_analytics` database.
- If performance is an issue, import only `daily_engagement` + `posts` + `users`.
- For large datasets, consider aggregations or DirectQuery (with caution).
