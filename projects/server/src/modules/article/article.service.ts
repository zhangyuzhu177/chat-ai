import axios from 'axios'
import OpenAI from "openai"

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { data } from 'cheerio/dist/commonjs/api/attributes';

@Injectable()
export class ArticleService {

  private readonly _openai: OpenAI

  constructor(
    private readonly _cfgSrv: ConfigService
  ) {
    this._openai = new OpenAI({
      apiKey: this._cfgSrv.get<string>('OPENAI_API_KEY'),
      baseURL: this._cfgSrv.get<string>('OPENAI_API_BASE_URL'),
    });
  }

  /**
   * 使用ai生成文章摘要
   */
  public async abstract(res: any) {
    if (!this._openai)
      return

    const articleRes = await axios.get('https://www.zyz01.top/api/article/entities/detail/60ee52f4-905b-4957-989a-46d555423bf2')

    if (!articleRes.data.data)
      return '暂无数据'

    const content = articleRes.data.data.content

    const prompt = `
      你是一名专业的中文编辑。请为以下文章生成一段简洁、连贯的中文摘要，要求：
      1. 摘要长度控制在 80 到 120 字之间；
      2. 语言流畅、通顺；
      3. 不要出现“本文”“文章”这样的措辞；
      4. 仅返回摘要内容，不要解释或附加说明。

      文章内容如下：
      ${content}
          `;

    const stream  = await this._openai.chat.completions.create({
      model: 'deepseek-ai/DeepSeek-V3.1-Terminus',
      messages: [
        { role: 'user', content: prompt }
      ],
      stream: true,
      max_completion_tokens: 200,
      temperature: 0.7,
    })

    // 设置 SSE 响应头（Server-Sent Events）
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 遍历流输出
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta)
        res.write(`data: ${delta}\n\n`);
    }

    res.write("data: [DONE]\n\n");
    res.end();

  }
}