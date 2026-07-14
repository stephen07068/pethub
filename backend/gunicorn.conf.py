import multiprocessing
import os

bind = "0.0.0.0:" + os.getenv("PORT", "5000")
workers = multiprocessing.cpu_count() * 2 + 1
threads = 2
worker_class = "gthread"
timeout = 120
accesslog = "-"
errorlog = "-"
loglevel = "info"
wsgi_app = "run:app"
