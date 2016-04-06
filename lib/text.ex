defmodule Typeracer.Text do
  def start_link do
    {:ok, text} = File.read("texts.txt")
    texts = for t <- String.split(text, "\n"), t != "", do: t
    IO.inspect(Enum.count(texts))
    Agent.start_link(fn -> texts end, name: __MODULE__)
  end

  def get(i) do
    Agent.get(__MODULE__, &Enum.at(&1, i))
  end

  def get_random do
    Agent.get(__MODULE__, fn x ->
      i = Enum.count(x) |> :random.uniform
      Enum.at(x, i - 1)
    end)
  end

end
