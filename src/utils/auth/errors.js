function normalizeErrorCode(value) {
  return String(value || '').trim().toLowerCase()
}

function normalizeErrorMessage(value) {
  return String(value || '').trim()
}

function resolveErrorCode(error) {
  if (!error || typeof error !== 'object') {
    return ''
  }

  return normalizeErrorCode(
    error.code
    || error.error_code
    || error.errorCode
    || error.name,
  )
}

function resolveErrorMessage(error) {
  if (!error) {
    return ''
  }

  if (typeof error === 'string') {
    return normalizeErrorMessage(error)
  }

  if (typeof error === 'object') {
    return normalizeErrorMessage(
      error.message
      || error.error_description
      || error.errorDescription
      || error.description
      || error.error,
    )
  }

  return normalizeErrorMessage(error)
}

export function formatSupabaseAuthError(error, fallback = '操作失败，请稍后再试。') {
  const code = resolveErrorCode(error)
  const message = resolveErrorMessage(error)

  if (code === 'over_email_send_rate_limit' || /email rate limit exceeded/i.test(message)) {
    return '当前登录请求较多，邮件通道触发了限流，请稍后再试。若你已有其他登录方式，建议先登录后再到账号中心绑定 Linux.do。'
  }

  if (/^over_.*rate_limit$/.test(code) || /rate limit|too many requests/i.test(message)) {
    return '当前操作过于频繁，请稍后再试。'
  }

  if (/Invalid login credentials/i.test(message))
    return '邮箱或密码不正确。'
  if (/Email not confirmed/i.test(message))
    return '邮箱尚未验证，请先打开验证邮件完成确认。'
  if (/User already registered/i.test(message))
    return '这个邮箱已经注册过了，请直接登录。'
  if (/Password should be at least/i.test(message))
    return '密码长度不足，请至少输入 6 位。'
  if (/Unable to validate email address/i.test(message))
    return '邮箱格式不正确，请检查后重试。'
  if (/provider is not enabled/i.test(message))
    return '当前第三方登录方式还未在 Supabase 后台启用。'
  if (/identity is already linked/i.test(message))
    return '这个登录方式已经绑定到当前账号。'
  if (/manual linking is disabled/i.test(message))
    return 'Supabase 还没有打开手动关联开关，请先在 Auth Providers 中启用 Enable Manual Linking。'
  if (/at least 2 identities/i.test(message))
    return '至少保留两种登录方式后，才能解除其中一种绑定。'
  if (/same password/i.test(message))
    return '新密码不能和当前密码相同。'
  if (/reauthentication/i.test(message))
    return '当前登录状态过旧，请重新登录后再修改密码。'
  if (/network/i.test(message))
    return '网络连接异常，请稍后重试。'

  return message || fallback
}
