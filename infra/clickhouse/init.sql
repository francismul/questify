-- Create database
CREATE DATABASE IF NOT EXISTS questify_analytics;

-- Use the database
-- (This would be run after connecting to the database)

-- Events table - stores all raw events
CREATE TABLE IF NOT EXISTS events (
    event_id UUID,
    event_type String,
    event_version String,
    timestamp DateTime64(3),
    correlation_id Nullable(String),
    user_id Nullable(UUID),
    family_id Nullable(UUID),
    payload String,
    metadata String,
    INDEX idx_event_type (event_type) TYPE bloom_filter GRANULARITY 1,
    INDEX idx_user_time (user_id, timestamp) TYPE minmax GRANULARITY 1,
    INDEX idx_family_time (family_id, timestamp) TYPE minmax GRANULARITY 1
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, event_id);

-- Task completions aggregated by day
CREATE TABLE IF NOT EXISTS task_completions_daily (
    date Date,
    user_id UUID,
    family_id UUID,
    completed_count UInt32,
    avg_time_taken Float32,
    late_count UInt32,
    on_time_count UInt32,
    avg_grade Float32
) ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, user_id, family_id);

-- Time tracking logs
CREATE TABLE IF NOT EXISTS time_logs (
    task_id UUID,
    user_id UUID,
    family_id UUID,
    start_time DateTime64(3),
    end_time DateTime64(3),
    duration_seconds UInt32,
    date Date DEFAULT toDate(start_time)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, user_id, task_id);

-- Streak tracking
CREATE TABLE IF NOT EXISTS streak_history (
    user_id UUID,
    date Date,
    streak_type String,
    streak_count UInt32,
    was_broken Boolean DEFAULT 0
) ENGINE = ReplacingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (user_id, date, streak_type);

-- Submission analytics
CREATE TABLE IF NOT EXISTS submission_analytics (
    submission_id UUID,
    task_id UUID,
    user_id UUID,
    family_id UUID,
    submitted_at DateTime64(3),
    reviewed_at Nullable(DateTime64(3)),
    grade Nullable(UInt8),
    max_grade Nullable(UInt8),
    is_late Boolean,
    attempt_number UInt8,
    review_time_seconds Nullable(UInt32)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(submitted_at)
ORDER BY (submitted_at, user_id);

-- User engagement metrics
CREATE TABLE IF NOT EXISTS user_engagement_daily (
    date Date,
    user_id UUID,
    family_id UUID,
    login_count UInt32,
    tasks_viewed UInt32,
    tasks_completed UInt32,
    submissions_created UInt32,
    time_spent_minutes UInt32
) ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, user_id);

-- Materialized view for real-time task completion stats
CREATE MATERIALIZED VIEW IF NOT EXISTS task_completion_stats_mv
ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, user_id)
AS SELECT
    toDate(timestamp) as date,
    user_id,
    family_id,
    countState() as total_completed,
    avgState(JSONExtractFloat(payload, 'timeTakenMinutes')) as avg_time,
    sumState(if(JSONExtractBool(payload, 'isLate'), 1, 0)) as late_count
FROM events
WHERE event_type = 'task.completed'
GROUP BY date, user_id, family_id;

-- Insert sample data for testing
INSERT INTO events VALUES
    (generateUUIDv4(), 'task.created', '1.0.0', now(), NULL, generateUUIDv4(), generateUUIDv4(), '{"taskId": "test"}', '{"source": "backend"}');
