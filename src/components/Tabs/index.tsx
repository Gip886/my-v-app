import React from 'react'

import styles from './styles.module.scss'

const Tabs: React.FC = () => {
  return (
    <div className={styles.tabs}>
      <li>大会员</li>
      <li>消息</li>
      <li>动态</li>
    </div>
  )
}

export default Tabs
