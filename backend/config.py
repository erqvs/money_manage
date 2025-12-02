import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # 数据库配置
    MYSQL_HOST = os.getenv('MYSQL_HOST', '112.124.97.21')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))
    MYSQL_USER = os.getenv('MYSQL_USER', 'money_manager')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'fawecafawerwesdfsdxafggsdfsdfwqeqwe')
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'money_manage')
    
    SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # 应用配置
    SECRET_KEY = os.getenv('SECRET_KEY', 'money-manage-secret-key-2024')

