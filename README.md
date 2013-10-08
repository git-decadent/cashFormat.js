<h3>jQuery plugin for translation input text data to cash format</h3>

<hr>

<h5>Initialization</h5>

<pre>
  $(selector).cashFormat([options])
</pre>


<hr>

<h5>Methods</h5>

  <strong>getValue</strong> - get value from the input. 
  
<pre>
  $(selector).cashFormat('getValue')
</pre>


<hr>

<h5>Options</h5>

  <strong>separator</strong> - A separator between the integer and fractional parts.
  <ul>
    <li>'.' - dot (default)</li>
    <li>',' - comma</li>
  </ul>
  
<pre>
  $(selector).cashFormat({separator: ','})
</pre>
