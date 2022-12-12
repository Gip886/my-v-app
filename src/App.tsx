import React, { useCallback, useEffect, useRef, useState } from 'react'
import NavBar from './components/NavBar'
import Tabs from './components/Tabs'
import BannerImage from './assets/banner.png'
import FooterImage from './assets/footer.jpg'
import Category from './components/Cateogory'
import classNames from 'classnames'
import { debounce } from 'lodash'

import styles from './styles.module.scss'
import { dataSource } from './constants/data'

const isInView = (el: HTMLVideoElement) => {
  const { top, bottom, left, right } = el.getBoundingClientRect()

  // 水平方向
  const isHorizontalInView = 0 < left && right < window.innerWidth
  // 垂直方向
  const isVerticalInView = top < window.innerHeight / 2 && window.innerHeight / 2 < bottom
  // 最终结果
  return isHorizontalInView && isVerticalInView
}

const App = () => {
  const oldYRef = useRef<number>(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef<HTMLDivElement>(null)
  const playingIds = useRef<string[]>([])
  const isScrolling = useRef<boolean>(false)

  const [hidden, setHidden] = useState<boolean>(false)

  const onScrollEnd = useCallback(
    debounce(() => {
      const videoEls: HTMLVideoElement[] = Array.from(document.querySelectorAll('video'))

      const inViewVideoEls = videoEls.filter((el) => isInView(el))

      if (inViewVideoEls.length > 0) {
        const ids: string[] = inViewVideoEls.map((el) => el.getAttribute('data-video-id') || '')

        // 停止旧视频(以前id不在这次播放的ids中)
        const stopIds = playingIds.current.filter((id) => !ids.includes(id))
        stopAll(stopIds)

        playAll(ids)
      } else {
        playAll(playingIds.current)
      }

      isScrolling.current = false
    }, 500),
    []
  )

  const onScroll = () => {
    if (!isScrolling.current) {
      pauseAll(playingIds.current)
    }

    isScrolling.current = true

    if (contentRef.current && offsetRef.current) {
      const { bottom: offsetBottom } = offsetRef.current.getBoundingClientRect()

      // 下滑超过 56 px 才做交互
      if (offsetBottom < 0) {
        const { top: newY } = contentRef.current.getBoundingClientRect()

        // 计算向上还是向下滑动
        const delta = newY - oldYRef.current

        // 更新上一次的 Y 值
        oldYRef.current = newY

        setHidden(delta < 0)
      }
    }

    // 停下来
    onScrollEnd()
  }

  useEffect(() => {
    const initVideoIds = dataSource.hot.list.slice(0, 2).map((item) => item.id)
    playAll(initVideoIds)
  }, [])

  const playAll = (ids: string[]) => {
    if (ids.length === 0) {
      return
    }

    const selector = ids.map((id) => `[data-video-id="${id}"]`).join(',')
    const videoEls: HTMLVideoElement[] = Array.from(document.querySelectorAll(selector))
    videoEls.forEach((el) => el.play())

    playingIds.current = ids
  }

  const stopAll = (ids: string[]) => {
    if (ids.length === 0) {
      return
    }

    const selector = ids.map((id) => `[data-video-id="${id}"]`).join(',')
    const videoEls: HTMLVideoElement[] = Array.from(document.querySelectorAll(selector))
    videoEls.forEach((el) => {
      el.pause()
      el.currentTime = 0
    })
  }

  const pauseAll = (ids: string[]) => {
    if (ids.length === 0) {
      return
    }

    const selector = ids.map((id) => `[data-video-id="${id}"]`).join(',')
    const videoEls: HTMLVideoElement[] = Array.from(document.querySelectorAll(selector))
    videoEls.forEach((el) => {
      el.pause()
    })
  }

  return (
    <div className={styles.app}>
      <header className={classNames(styles.header, { [styles.hidden]: hidden })}>
        <NavBar title="首页" />

        <Tabs />
      </header>

      <div className={styles.line}></div>

      <div className={styles.scrollView} onScroll={onScroll}>
        <div ref={offsetRef} className={styles.offset} />
        <img className={styles.banner} src={BannerImage} alt="Banner" />

        <div className={styles.content} ref={contentRef}>
          <h2>{dataSource.hot.title}</h2>
          <Category onScroll={onScroll} list={dataSource.hot.list} />

          <h2>{dataSource.live.title}</h2>
          <Category onScroll={onScroll} list={dataSource.live.list} />

          <h2>{dataSource.recommend.title}</h2>
          <Category onScroll={onScroll} list={dataSource.recommend.list} />
        </div>

        <img className={styles.banner} src={FooterImage} alt="Footer" />

        <footer className={styles.footer}>
          <span>@Bilibili 2022</span>
        </footer>
      </div>
    </div>
  )
}

export default App
