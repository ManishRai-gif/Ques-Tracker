export const detectPlatform = (url) => {
  if (!url) return 'Custom'
  if (url.includes('leetcode.com'))      return 'LeetCode'
  if (url.includes('codeforces.com'))    return 'Codeforces'
  if (url.includes('geeksforgeeks.org')) return 'GeeksForGeeks'
  if (url.includes('hackerrank.com'))    return 'HackerRank'
  if (url.includes('codechef.com'))      return 'CodeChef'
  if (url.includes('atcoder.jp'))        return 'AtCoder'
  if (url.includes('spoj.com'))          return 'SPOJ'
  return 'Custom'
}
