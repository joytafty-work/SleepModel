import os
import redis
# For sleepmodel app
redis_url = os.getenv('REDISTOGO_URL', 'redis://localhost:10941')
redis = redis.from_url(redis_url)