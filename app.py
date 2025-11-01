#!/usr/bin/python

# Copyright 2025 Rahmat Adha
# Licensed under the Apache License, Version 2.0
# Nama author tidak boleh diubah atau dihapus.

import os
import secrets
import requests
from dotenv import load_dotenv
from flask_compress import Compress
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, render_template, redirect, url_for, session

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Konfigurasi dari environment variables atau fallback ke default
FB_APP_ID = os.getenv('FB_APP_ID')
FB_APP_SECRET = os.getenv('FB_APP_SECRET')
REDIRECT_URI = os.getenv('REDIRECT_URI')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))

# Session configuration for security
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)

# Compression
app.config['COMPRESS_ALGORITHM'] = ['br', 'gzip']
app.config['COMPRESS_LEVEL'] = 9
app.config['COMPRESS_MIN_SIZE'] = 500
Compress(app)

# ==================== SECURITY HELPERS ====================

def generate_state_token():
  """Generate random state token for CSRF protection"""
  return secrets.token_urlsafe(32)

def verify_state_token(provided_state):
  """Verify state token matches session"""
  session_state = session.get('oauth_state')
  if not session_state or not provided_state:
    return False
  return secrets.compare_digest(session_state, provided_state)

# ==================== ERROR HANDLERS ====================

@app.errorhandler(400)
def bad_request_error(error):
  """Handle 400 Bad Request"""
  return render_template('errors/400.html'), 400

@app.errorhandler(403)
def forbidden_error(error):
  """Handle 403 Forbidden"""
  return render_template('errors/403.html'), 403

@app.errorhandler(404)
def not_found_error(error):
  """Handle 404 Not Found"""
  return render_template('errors/404.html'), 404

@app.errorhandler(500)
def internal_error(error):
  """Handle 500 Internal Server Error"""
  return render_template('errors/500.html'), 500

@app.errorhandler(Exception)
def handle_exception(error):
  """Handle all unhandled exceptions"""
  app.logger.error(f'Unhandled exception: {error}')
  return render_template('errors/500.html'), 500

# ==================== ROUTES ====================

@app.after_request
def set_security_headers(response):
  """Add security headers to all responses"""
  response.headers['X-Content-Type-Options'] = 'nosniff'
  response.headers['X-Frame-Options'] = 'DENY'
  response.headers['X-XSS-Protection'] = '1; mode=block'
  response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
  if request.path.startswith("/static/"): response.headers["Cache-Control"] = "public, max-age=2592000, immutable"
  return response

@app.route('/')
def home():
  """Halaman utama - menampilkan daftar akun atau form login"""

  extended_scopes = [
    # Basic User Info
    'public_profile',
    'email',
    'user_birthday',
    'user_hometown',
    'user_location',
    'user_friends',
    'user_age_range',
    'user_gender',
    'user_link',
    
    # User Posts & Feed
    'user_posts',                    # Baca posts yang dibuat user
    'user_photos',                   # Akses foto user
    'user_videos',                   # Akses video user
    
    # Publishing to User Timeline
    'publish_to_groups',             # Post ke grup (jika member)
    'publish_video',                 # Upload video ke timeline
    
    # Pages Management (PENTING untuk manage pages)
    'pages_show_list',               # Lihat daftar pages yang di-manage
    'pages_read_engagement',         # Baca engagement metrics (likes, comments, etc)
    'pages_manage_posts',            # Buat, edit, hapus posts di page
    'pages_manage_engagement',       # Balas komentar, moderate
    'pages_read_user_content',       # Baca konten yang di-tag/mention page
    'pages_manage_metadata',         # Edit info page
    'pages_manage_ads',              # Manage ads (optional)
    'pages_manage_cta',              # Manage call-to-action buttons
    'pages_messaging',               # Send messages dari page (Messenger)
    
    # Instagram (jika page terhubung dengan Instagram)
    'instagram_basic',               # Basic Instagram access
    'instagram_content_publish',     # Post ke Instagram
    'instagram_manage_comments',     # Manage Instagram comments
    'instagram_manage_insights',     # Lihat Instagram insights
    
    # Business/Advanced
    'business_management',           # Manage business assets
    'catalog_management',            # Manage product catalogs
    'leads_retrieval',               # Ambil leads dari ads
    'read_insights',                 # Baca insights/analytics
    'ads_management',                # Manage ads (optional)
  ]
  scope_string = ','.join(extended_scopes)
  
  # Generate and store state token
  state_token = generate_state_token()
  session['oauth_state'] = state_token
  session.permanent = True
  
  auth_url = (
    f"https://www.facebook.com/v18.0/dialog/oauth?"
    f"client_id={FB_APP_ID}&"
    f"redirect_uri={REDIRECT_URI}&"
    f"scope={scope_string}&"
    f"response_type=code&"
    f"state={state_token}&"
    f"auth_type=rerequest"
  )
  
  return render_template('home.html', auth_url=auth_url)

@app.route('/privacy')
def privacy():
  """Privacy Policy Page"""
  return render_template('privacy.html')

@app.route('/terms')
def terms():
  """Terms of Service Page"""
  return render_template('terms.html')

@app.route('/contact')
def contact():
  """Contact Page"""
  return render_template('contact.html')

@app.route('/view/<user_id>')
def view_account(user_id):
  """View account details dan validasi dengan Facebook API"""
  # Sanitize user_id - only allow digits
  if not user_id.isdigit():
    return render_template('errors/400.html'), 400
  
  return render_template('view_account.html', user_id=user_id)

@app.route('/callback')
def callback():
  """Handle OAuth callback dari Facebook"""
  
  # Check for errors first
  error = request.args.get('error')
  if error:
    error_description = request.args.get('error_description', 'Unknown error')
    error_reason = request.args.get('error_reason', '')
    
    # Clear session
    session.pop('oauth_state', None)
    
    return render_template('result_display.html',
                         error=error,
                         error_description=error_description,
                         error_reason=error_reason,
                         error_message=error_description,
                         is_active=False,
                         user_info=None,
                         access_token=None,
                         token_type=None,
                         expires_in=None,
                         expiry_date=None,
                         expiry_timestamp=None,
                         all_permissions=None,
                         pages=None,
                         profile_picture=None)
  
  # Verify state token (CSRF protection)
  state = request.args.get('state')
  if not verify_state_token(state):
    app.logger.warning(f'Invalid state token: {state}')
    session.pop('oauth_state', None)
    return render_template('result_display.html',
                         error="Security Error",
                         error_description="Invalid state parameter. Possible CSRF attack detected.",
                         error_reason="invalid_state",
                         error_message="Invalid state parameter. Please try again.",
                         is_active=False,
                         user_info=None,
                         access_token=None,
                         token_type=None,
                         expires_in=None,
                         expiry_date=None,
                         expiry_timestamp=None,
                         all_permissions=None,
                         pages=None,
                         profile_picture=None)
  
  # Clear state from session after verification
  session.pop('oauth_state', None)
  
  # Get authorization code
  code = request.args.get('code')
  if not code:
    return render_template('result_display.html',
                         error="Missing Code",
                         error_description="Authorization code tidak ditemukan di URL",
                         error_reason="missing_code",
                         error_message="Authorization code tidak ditemukan di URL",
                         is_active=False,
                         user_info=None,
                         access_token=None,
                         token_type=None,
                         expires_in=None,
                         expiry_date=None,
                         expiry_timestamp=None,
                         all_permissions=None,
                         pages=None,
                         profile_picture=None)
  
  token_url = 'https://graph.facebook.com/v18.0/oauth/access_token'
  token_params = {
    'client_id': FB_APP_ID,
    'client_secret': FB_APP_SECRET,
    'redirect_uri': REDIRECT_URI,
    'code': code
  }
  
  try:
    token_response = requests.get(token_url, params=token_params, timeout=15)
    token_data = token_response.json()
    
    if 'error' in token_data:
      return render_template('result_display.html',
                           error=token_data['error'].get('type', 'Error'),
                           error_description=token_data['error'].get('message', 'Unknown error'),
                           error_reason='token_error',
                           error_message=token_data['error'].get('message', 'Unknown error'),
                           is_active=False,
                           user_info=None,
                           access_token=None,
                           token_type=None,
                           expires_in=None,
                           expiry_date=None,
                           expiry_timestamp=None,
                           all_permissions=None,
                           pages=None,
                           profile_picture=None)
    
    access_token = token_data.get('access_token')
    token_type = token_data.get('token_type', 'bearer')
    expires_in = token_data.get('expires_in', 0)
    
    # Hitung timestamp kadaluarsa
    expiry_datetime = datetime.now() + timedelta(seconds=expires_in)
    expiry_date = expiry_datetime.strftime("%d %B %Y, %H:%M:%S WIB")
    expiry_timestamp = int(expiry_datetime.timestamp())
    
    # Get user info dengan foto profil
    user_info_url = f'https://graph.facebook.com/v18.0/me?fields=id,name,email,picture.type(large)&access_token={access_token}'
    user_response = requests.get(user_info_url, timeout=15)
    user_info = user_response.json()
    
    if 'error' in user_info:
      return render_template('result_display.html',
                           error="API Error",
                           error_description=user_info['error'].get('message', 'Failed to get user info'),
                           error_reason='api_error',
                           error_message=user_info['error'].get('message', 'Failed to get user info'),
                           is_active=False,
                           user_info=None,
                           access_token=None,
                           token_type=None,
                           expires_in=None,
                           expiry_date=None,
                           expiry_timestamp=None,
                           all_permissions=None,
                           pages=None,
                           profile_picture=None)
    
    # Ambil URL foto profil
    profile_picture = user_info.get('picture', {}).get('data', {}).get('url', '')
    
    permissions_url = f'https://graph.facebook.com/v18.0/me/permissions?access_token={access_token}'
    permissions_response = requests.get(permissions_url, timeout=15)
    permissions_data = permissions_response.json()
    
    all_permissions = permissions_data.get('data', [])
    
    pages = []
    granted_perms = [p['permission'] for p in all_permissions if p['status'] == 'granted']
    if any(perm in granted_perms for perm in ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts']):
      try:
        pages_url = f'https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,category&access_token={access_token}'
        pages_response = requests.get(pages_url, timeout=15)
        pages_data = pages_response.json()
        pages = pages_data.get('data', [])
      except:
        pages = []
    
    return render_template('result_display.html',
                         access_token=access_token,
                         token_type=token_type,
                         expires_in=expires_in,
                         expiry_date=expiry_date,
                         expiry_timestamp=expiry_timestamp,
                         user_info=user_info,
                         all_permissions=all_permissions,
                         pages=pages,
                         is_active=True,
                         profile_picture=profile_picture,
                         error=None,
                         error_description=None,
                         error_reason=None,
                         error_message=None)
  
  except requests.exceptions.Timeout:
    app.logger.error('Request timeout in callback')
    return render_template('result_display.html',
                         error="Timeout",
                         error_description="Request timeout - Facebook API tidak merespons",
                         error_reason='timeout',
                         error_message="Request timeout",
                         is_active=False,
                         user_info=None,
                         access_token=None,
                         token_type=None,
                         expires_in=None,
                         expiry_date=None,
                         expiry_timestamp=None,
                         all_permissions=None,
                         pages=None,
                         profile_picture=None)
  except Exception as e:
    app.logger.error(f'Exception in callback: {str(e)}')
    return render_template('result_display.html',
                         error="Exception",
                         error_description=str(e),
                         error_reason='exception',
                         error_message=str(e),
                         is_active=False,
                         user_info=None,
                         access_token=None,
                         token_type=None,
                         expires_in=None,
                         expiry_date=None,
                         expiry_timestamp=None,
                         all_permissions=None,
                         pages=None,
                         profile_picture=None)

@app.route('/api/validate-token', methods=['POST'])
def validate_token():
  """API endpoint untuk validasi token dan exchange ke long-lived token"""
  try:
    # Validate content type
    if not request.is_json:
      return jsonify({
        'success': False,
        'error': 'Content-Type must be application/json'
      }), 400
    
    data = request.get_json()
    access_token = data.get('access_token')
    
    if not access_token:
      return jsonify({
        'success': False,
        'error': 'Access token tidak ditemukan'
      }), 400
    
    # Validate token format (basic check)
    if not isinstance(access_token, str) or len(access_token) < 50:
      return jsonify({
        'success': False,
        'error': 'Invalid access token format'
      }), 400
    
    # 1. Validate token with Facebook API
    user_info_url = f'https://graph.facebook.com/v18.0/me?fields=id,name,email,picture.type(large)&access_token={access_token}'
    
    try:
      user_response = requests.get(user_info_url, timeout=15)
      user_data = user_response.json()
    except requests.exceptions.Timeout:
      return jsonify({
        'success': False,
        'error': 'Request timeout - Facebook API tidak merespons'
      }), 408
    except requests.exceptions.RequestException as e:
      return jsonify({
        'success': False,
        'error': f'Gagal menghubungi Facebook API: {str(e)}'
      }), 500
    
    if 'error' in user_data:
      error_message = user_data['error'].get('message', 'Unknown error')
      
      # Simplify common error messages
      if 'Malformed access token' in error_message:
        error_message = 'Invalid OAuth access token - Cannot parse access token'
      elif 'expired' in error_message.lower():
        error_message = 'Access token has expired'
      elif 'invalid' in error_message.lower():
        error_message = 'Invalid access token'
      
      return jsonify({
        'success': False,
        'error': error_message,
        'error_code': user_data['error'].get('code'),
        'error_type': user_data['error'].get('type')
      })
    
    # 2. Exchange for long-lived token
    token_exchange_url = 'https://graph.facebook.com/v18.0/oauth/access_token'
    token_params = {
      'grant_type': 'fb_exchange_token',
      'client_id': FB_APP_ID,
      'client_secret': FB_APP_SECRET,
      'fb_exchange_token': access_token
    }
    
    new_token_data = None
    try:
      token_response = requests.get(token_exchange_url, params=token_params, timeout=15)
      new_token_data = token_response.json()
      
      if 'error' in new_token_data:
        app.logger.warning(f'Token exchange failed: {new_token_data["error"]}')
        new_token_data = None
    except Exception as e:
      app.logger.warning(f'Token exchange error: {str(e)}')
      new_token_data = None
    
    # 3. Get permissions
    permissions_url = f'https://graph.facebook.com/v18.0/me/permissions?access_token={access_token}'
    try:
      permissions_response = requests.get(permissions_url, timeout=15)
      permissions_data = permissions_response.json()
      all_permissions = permissions_data.get('data', [])
    except:
      all_permissions = []
    
    # 4. Get pages if has permission
    pages = []
    granted_perms = [p['permission'] for p in all_permissions if p['status'] == 'granted']
    if any(perm in granted_perms for perm in ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts']):
      try:
        token_to_use = new_token_data.get('access_token') if new_token_data else access_token
        pages_url = f'https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,category,perms&access_token={token_to_use}'
        pages_response = requests.get(pages_url, timeout=15)
        pages_data = pages_response.json()
        
        raw_pages = pages_data.get('data', [])
        for page in raw_pages:
          perms_list = page.get('perms', [])
          page['permissions'] = [{'permission': perm, 'status': 'granted'} for perm in perms_list]
        
        pages = raw_pages
      except:
        pages = []
    
    # Build response
    response_data = {
      'success': True,
      'data': {
        'id': user_data.get('id'),
        'name': user_data.get('name'),
        'email': user_data.get('email', ''),
        'profile_picture': user_data.get('picture', {}).get('data', {}).get('url', ''),
        'permissions': all_permissions,
        'pages': pages
      }
    }
    
    # Add new token data if exchange was successful
    if new_token_data and 'access_token' in new_token_data:
      new_access_token = new_token_data.get('access_token')
      new_token_type = new_token_data.get('token_type', 'bearer')
      new_expires_in = new_token_data.get('expires_in', 0)
      
      expiry_datetime = datetime.now() + timedelta(seconds=new_expires_in)
      expiry_date = expiry_datetime.strftime("%d %B %Y, %H:%M:%S WIB")
      expiry_timestamp = int(expiry_datetime.timestamp())
      
      response_data['data']['new_token'] = {
        'access_token': new_access_token,
        'token_type': new_token_type,
        'expires_in': new_expires_in,
        'expiry_date': expiry_date,
        'expiry_timestamp': expiry_timestamp
      }
    
    return jsonify(response_data)
    
  except Exception as e:
    app.logger.error(f'Exception in validate_token: {str(e)}')
    return jsonify({
      'success': False,
      'error': f'Server error: {str(e)}'
    }), 500

@app.route('/api/graph-request', methods=['POST'])
def graph_request():
  """API endpoint untuk Graph API requests"""
  try:
    # Validate content type
    if not request.is_json:
      return jsonify({
        'error': 'Invalid Content-Type',
        'message': 'Content-Type must be application/json'
      }), 400
    
    data = request.get_json()
    
    method = data.get('method', 'GET')
    path = data.get('path', '/me')
    access_token = data.get('access_token')
    params = data.get('params', {})
    body = data.get('body', {})
    
    # Validate inputs
    if not access_token:
      return jsonify({
        'error': 'Missing access token',
        'message': 'Access token is required'
      }), 400
    
    # Validate token format
    if not isinstance(access_token, str) or len(access_token) < 50:
      return jsonify({
        'error': 'Invalid access token',
        'message': 'Access token format is invalid'
      }), 400
    
    # Validate method
    allowed_methods = ['GET', 'POST', 'DELETE']
    if method not in allowed_methods:
      return jsonify({
        'error': 'Invalid method',
        'message': f'Method must be one of: {", ".join(allowed_methods)}'
      }), 400
    
    # Validate path
    if not path or not isinstance(path, str):
      return jsonify({
        'error': 'Invalid path',
        'message': 'Path must be a non-empty string'
      }), 400
    
    # Clean path
    if path.startswith('/'):
      path = path[1:]
    
    # Prevent path traversal
    if '..' in path or path.startswith('/'):
      return jsonify({
        'error': 'Invalid path',
        'message': 'Path traversal not allowed'
      }), 400
    
    # Build URL
    base_url = f'https://graph.facebook.com/v18.0/{path}'
    
    # Add access token to params
    params['access_token'] = access_token
    
    # Make request based on method
    try:
      if method == 'GET':
        response = requests.get(base_url, params=params, timeout=20)
      elif method == 'POST':
        response = requests.post(base_url, params=params, json=body, timeout=20)
      elif method == 'DELETE':
        response = requests.delete(base_url, params=params, timeout=20)
    except requests.exceptions.Timeout:
      return jsonify({
        'error': 'Request Timeout',
        'message': 'Request took too long to complete'
      }), 408
    except requests.exceptions.RequestException as e:
      return jsonify({
        'error': 'Request Failed',
        'message': str(e)
      }), 500
    
    # Return response
    try:
      response_data = response.json()
    except:
      response_data = {'message': response.text}
    
    return jsonify(response_data), response.status_code
    
  except Exception as e:
    app.logger.error(f'Exception in graph_request: {str(e)}')
    return jsonify({
      'error': 'Server Error',
      'message': str(e)
    }), 500

if __name__ == '__main__':
  app.run(debug=False)
