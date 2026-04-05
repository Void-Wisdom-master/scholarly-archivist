import { Collection, ArchiveCard, Source, Message, Artifact, View } from './types';

export const NAV_ITEMS: { id: View, label: string, icon: string, path: string }[] = [
  { id: 'LIBRARY', label: '大图书馆', icon: 'local_library', path: '/library' },
  { id: 'GALLERY', label: '文思阁', icon: 'auto_stories', path: '/gallery' },
  { id: 'CHAT', label: '敏学好问', icon: 'forum', path: '/notebook' },
];

export const MOCK_DATA: {
  library: Collection[];
  gallery: ArchiveCard[];
  sources: Source[];
  initialChat: Message[];
  initialArtifacts: Artifact[];
} = {
  library: [
    {
      id: 'd1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1',
      collectionNum: '001',
      title: '18世纪欧洲启蒙运动',
      description: '分析1700年代主导欧洲思想界的智识与哲学运动，探讨其对现代政治与社会的影响',
      sourceCount: 124,
      lastUpdated: '1789-10-12',
      icon: 'auto_stories'
    },
    {
      id: 'd2b2b2b2-b2b2-4b2b-b2b2-b2b2b2b2b2b2',
      collectionNum: '042',
      title: '宋代海外贸易研究',
      description: '全面追踪宋朝期间的海上丝绸之路及贸易物流体系',
      sourceCount: 89,
      lastUpdated: '2023-11-24',
      icon: 'history_edu'
    }
  ],
  gallery: [
    {
      id: 'g1',
      category: '哲学',
      categoryColor: 'bg-secondary-container text-on-secondary-container',
      date: '2024-03-22',
      title: '论时间感知的二元性',
      content: '“时间不是一条直线，而是一层层重叠的墨迹，最新的那一层永远无法完全遮盖最旧的……',
      source: '来源：辩证法模块',
      icon: 'history_edu',
      actionIcon: 'bookmark'
    }
  ],
  sources: [
    { id: 's1', type: 'PDF 档案', title: '威斯特伐利亚和约 (1648)', date: '10-12', icon: 'picture_as_pdf' },
    { id: 's2', type: 'Markdown', title: '现代性起源笔记', date: '2小时前', icon: 'description' }
  ],
  initialChat: [
    {
      id: 'm1',
      role: 'user',
      content: '根据洛克的手稿，他关于“白板说”（Tabula Rasa）的观点是如何影响8世纪欧洲教育改革的？',
      time: '14:22'
    },
    {
      id: 'm2',
      role: 'ai',
      content: '洛克将心灵构想为一张“没有任何文字、不具任何思想的白纸”，这成为了教育从神学教条转向经验观察的主要催化剂。',
      time: '14:23'
    }
  ],
  initialArtifacts: [
    {
      id: 'a1',
      type: '洞察卡片 #12',
      title: '心灵白板',
      content: '人的心灵如同一张白纸，上面没有任何字迹，没有任何思想...',
      tags: ['经验主义', '洛克'],
      color: 'border-primary/40'
    },
    {
      id: 'a2',
      type: '结构节点',
      title: '世俗教育普及',
      content: '海上贸易与港口城市世俗教育普及之间的相关性',
      tags: ['贸易路线', '社会学'],
      color: 'border-secondary/40'
    }
  ]
};